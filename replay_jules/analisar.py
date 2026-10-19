"""Extrai o texto dos PDFs gerados e confere cada cenario contra o resultado ESPERADO, escrito por extenso aqui
(nunca calculado pelo codigo testado). Tambem compara o texto inteiro entre variantes.
Uso: python -I analisar.py
"""
import difflib, re, sys
from pathlib import Path
import pdfplumber

RAIZ = Path(__file__).parent
VARIANTES = ["base", "real", "jules"]
CENARIOS = ["c1_nao_nao", "c2_sim_so_cozinha", "c3_ja_rebaixado", "c4_controle_nulos", "c5_extra_cm_ausente"]
AMB = {"cozinha": "Cozinha / Área de Serviço", "dorm": "Dormitório Casal"}

def texto(var, cen):
    pdf = next((RAIZ / "out" / var / cen).glob("*.pdf"))
    with pdfplumber.open(pdf) as p:
        return "\n".join((pg.extract_text() or "") for pg in p.pages)

def blocos(t):
    """{ambiente: [linhas]} da secao 'Checklist Completa'."""
    t = t.split("Checklist Completa", 1)[1]
    linhas = t.split("\n")
    out, atual = {}, None
    for ln in linhas:
        for chave, nome in AMB.items():
            if ln.strip().startswith(nome):
                atual = chave; out[atual] = []; break
        else:
            if atual: out[atual].append(ln)
    return out

def perguntas(linhas):
    """[(G1|G5, resposta)] na ordem; e numero de linhas de CC logo apos cada uma."""
    res, i = [], 0
    while i < len(linhas):
        m = re.match(r"(G[15]) —", linhas[i])
        if m:
            j = i
            while j < len(linhas) and not linhas[j].startswith("Resposta:"): j += 1
            resp = linhas[j].replace("Resposta:", "").strip() if j < len(linhas) else "?"
            res.append((m.group(1), resp)); i = j
        i += 1
    return res

def ccs(linhas):
    return sum(1 for l in linhas if l.startswith("CC:"))

# ESPERADO por extenso (regra do card)
ESPERADO = {
    "c1_nao_nao": {"cozinha": ([("G1", "Não"), ("G5", "Não")], 0), "dorm": ([("G1", "Não"), ("G5", "Não")], 0)},
    "c2_sim_so_cozinha": {"cozinha": ([("G1", "Sim"), ("G5", "Sim — 10 cm")], 2), "dorm": ([("G1", "Não"), ("G5", "Não")], 0)},
    "c3_ja_rebaixado": {"cozinha": ([("G1", "Não"), ("G5", "Não")], 0), "dorm": ([("G1", "Não"), ("G5", "Não")], 0)},
    "c4_controle_nulos": {"cozinha": ([], 0), "dorm": ([], 0)},
}

falhas = {v: 0 for v in VARIANTES}
for cen in CENARIOS:
    print(f"\n=== {cen} ===")
    for v in VARIANTES:
        b = blocos(texto(v, cen))
        obs = {a: (perguntas(l), ccs(l)) for a, l in b.items()}
        if cen in ESPERADO:
            ok = obs == ESPERADO[cen]
            falhas[v] += 0 if ok else 1
            print(f"  [{v:5}] {'PASSA' if ok else 'FALHA'}  cozinha={obs['cozinha']}  dorm={obs['dorm']}")
        else:
            print(f"  [{v:5}] (sem esperado)  cozinha={obs['cozinha']}  dorm={obs['dorm']}")

print("\n=== texto completo do PDF: real x jules (igual = comportamento igual) ===")
for cen in CENARIOS:
    a, b = texto("real", cen), texto("jules", cen)
    if a == b:
        print(f"  {cen}: IDENTICO")
    else:
        d = [l for l in difflib.unified_diff(a.split("\n"), b.split("\n"), "real", "jules", lineterm="", n=0) if not l.startswith(("---", "+++", "@@"))]
        print(f"  {cen}: DIFERE em {len(d)} linhas"); [print("     ", l[:140]) for l in d[:12]]

print("\n=== resumo (cenarios do card c1-c4 que falharam) ===")
for v in VARIANTES: print(f"  {v}: {falhas[v]} falha(s) de 4")
