"""Rodada 2 (card #110). Le os PDFs e confere, por cenario e variante:
  - ordem das linhas da tabela de eletros (pelas etiquetas C-xxx / O-xxx no modelo);
  - cada link do PDF aponta para a URL da propria linha;
  - o estado passado a gerarPdf nao foi alterado.
O ESPERADO esta escrito por extenso (regra do card), nunca calculado pelo codigo testado.
Uso: python -I analisar.py [variantes...]   (padrao: base real jules)
"""
import difflib, re, sys
from pathlib import Path
import pdfplumber

RAIZ = Path(__file__).parent
VARIANTES = sys.argv[1:] or ["base", "real", "jules"]
CENARIOS = ["c1_cozinha_card", "c2_outros_todos", "c3_controle_em_ordem", "c4_controle_sem_eletros", "c5_extra_mesmo_tipo"]
TAG = re.compile(r"\b([CO]-[A-Z0-9]{4})\b")

ESPERADO = {
    "c1_cozinha_card": ["C-COOK", "C-REFR", "C-DEPU", "C-LAVA"],
    "c2_outros_todos": ["O-COOK", "O-FOGA", "O-REFR", "O-MICR", "O-FORN", "O-DEPU", "O-OUTR", "O-COIF", "O-LAVR"],
    "c3_controle_em_ordem": ["C-COOK", "C-FOGA", "C-LAVA", "O-REFR", "O-COIF"],
    "c4_controle_sem_eletros": [],
}

def pdf_de(var, cen):
    return next((RAIZ / "out" / var / cen).glob("*.pdf"))

def texto(var, cen):
    with pdfplumber.open(pdf_de(var, cen)) as p:
        return "\n".join((pg.extract_text() or "") for pg in p.pages)

def ordem(var, cen):
    t = texto(var, cen).split("Checklist Completa", 1)[-1]
    return TAG.findall(t)

def links_errados(var, cen):
    """(1) Cada link aponta para a URL da etiqueta na mesma altura da pagina.
    (2) Cada linha que mostra 'Ver link' tem um link clicavel (o texto 'Ver link' vem do proprio eletro)."""
    erros, total = [], 0
    with pdfplumber.open(pdf_de(var, cen)) as p:
        for pg in p.pages:
            todas = pg.extract_words()
            palavras = [w for w in todas if TAG.fullmatch(w["text"])]
            na_linha = lambda y, ws: [w for w in ws if w["top"] - 4 <= y <= w["bottom"] + 4]
            for h in pg.hyperlinks:
                total += 1
                linha = [w["text"] for w in na_linha((h["top"] + h["bottom"]) / 2, palavras)]
                esperado = f"https://exemplo.test/{linha[0].lower()}" if len(linha) == 1 else None
                if h.get("uri") != esperado:
                    erros.append(f"{linha or '?'} -> {h.get('uri')}")
            for w in palavras:
                meio = (w["top"] + w["bottom"]) / 2
                mostra = any(x["text"] == "Ver" for x in na_linha(meio, todas))
                tem = any(h["top"] - 4 <= meio <= h["bottom"] + 4 for h in pg.hyperlinks)
                if mostra and not tem:
                    erros.append(f"['{w['text']}'] mostra 'Ver link' sem link clicavel")
    return total, erros

falhas = {v: 0 for v in VARIANTES}
for cen in CENARIOS:
    print(f"\n=== {cen} ===")
    for v in VARIANTES:
        obs = ordem(v, cen)
        total, erros = links_errados(v, cen)
        estado = (RAIZ / "out" / v / cen / "estado.txt").read_text()
        ok_ordem = obs == ESPERADO[cen] if cen in ESPERADO else None
        ok = (ok_ordem is not False) and not erros and estado == "intacto"
        if cen in ESPERADO:
            falhas[v] += 0 if ok else 1
        rot = ("PASSA" if ok else "FALHA") if cen in ESPERADO else ("(sem esperado)" if ok else "FALHA")
        print(f"  [{v:5}] {rot}  ordem={obs}  links={total} clicaveis, {len(erros)} problema(s)  estado={estado}")
        for e in erros:
            print(f"           link errado: {e}")

if "real" in VARIANTES and "jules" in VARIANTES:
    print("\n=== texto completo do PDF: real x jules (igual = comportamento igual) ===")
    for cen in CENARIOS:
        a, b = texto("real", cen), texto("jules", cen)
        if a == b:
            print(f"  {cen}: IDENTICO")
        else:
            d = [l for l in difflib.unified_diff(a.split("\n"), b.split("\n"), "real", "jules", lineterm="", n=0) if not l.startswith(("---", "+++", "@@"))]
            print(f"  {cen}: DIFERE em {len(d)} linhas"); [print("     ", l[:140]) for l in d[:12]]

print("\n=== resumo (cenarios c1-c4 que falharam) ===")
for v in VARIANTES: print(f"  {v}: {falhas[v]} falha(s) de 4")
