export const TIPOS_CUBA = ['Embutir', 'Semi-encaixe', 'Sobrepor', 'Apoio', 'Esculpida']

export const TAMANHOS_CAMA = [
  { value: 'solteiro', label: 'Solteiro (0,88 Ã— 1,88 m)' },
  { value: 'padrao', label: 'PadrÃ£o (1,38 Ã— 1,88 m)' },
  { value: 'queen', label: 'Queen (1,58 Ã— 1,98 m)' },
  { value: 'king', label: 'King (2,00 Ã— 2,03 m)' },
  { value: 'outro', label: 'Outro' },
]

export const ELETROS_CONFIG = [
  { tipo: 'FogÃ£o', subtipos: ['Piso', 'Embutido'] },
  { tipo: 'Cooktop', subtipos: [] },
  { tipo: 'Refrigerador', subtipos: ['Duplex', 'Inverse', 'Side by Side'] },
  { tipo: 'Microondas', subtipos: ['Normal', 'Embutido'] },
  { tipo: 'Forno', subtipos: ['Normal', 'Embutido'] },
  { tipo: 'Depurador', subtipos: ['Normal', 'Embutido'] },
  { tipo: 'Coifa', subtipos: ['Parede', 'Ilha'] },
  { tipo: 'Lava-louÃ§a', subtipos: ['Piso', 'Embutido'] },
  { tipo: 'Lava-roupa', subtipos: ['Abertura Frontal', 'Abertura Superior'] },
  { tipo: 'Outros', subtipos: [] },
]

export const ELETRONICOS_CONFIG = [
  { tipo: 'TV', subtipos: [] },
  { tipo: 'Home Theater', subtipos: [] },
  { tipo: 'Videogame', subtipos: [] },
  { tipo: 'Computador', subtipos: [] },
  { tipo: 'Outros', subtipos: [] },
]

function preenchido(valor) {
  if (typeof valor === 'string') {
    return valor.trim() !== ''
  }

  return valor !== null && valor !== undefined && valor !== ''
}

function validarEletros(resp, erros) {
  const eletros = resp.eletros || []

  if (eletros.length === 0) {
    erros.eletros = 'Adicione ao menos um eletro'
    return
  }

  eletros.forEach((eletro, index) => {
    const config = ELETROS_CONFIG.find((item) => item.tipo === eletro.tipo) || { subtipos: [] }
    const depuradorEmbutido = eletro.tipo === 'Depurador' && eletro.subtipo === 'Embutido'

    if (config.subtipos.length > 0 && !preenchido(eletro.subtipo)) {
      erros[`eletro_${index}_subtipo`] = 'ObrigatÃ³rio'
    }
    if (eletro.tipo === 'Outros' && !preenchido(eletro.descricao)) {
      erros[`eletro_${index}_descricao`] = 'Descreva qual eletro Ã©'
    }
    if (!preenchido(eletro.largura_cm)) {
      erros[`eletro_${index}_largura`] = 'ObrigatÃ³rio'
    }
    if (!preenchido(eletro.altura_cm)) {
      erros[`eletro_${index}_altura`] = 'ObrigatÃ³rio'
    }
    if (!preenchido(eletro.profundidade_cm)) {
      erros[`eletro_${index}_prof`] = 'ObrigatÃ³rio'
    }
    if (depuradorEmbutido && !preenchido(eletro.modelo)) {
      erros[`eletro_${index}_modelo`] = 'ObrigatÃ³rio para Depurador Embutido'
    }
    if (depuradorEmbutido && !preenchido(eletro.link)) {
      erros[`eletro_${index}_link`] = 'ObrigatÃ³rio para Depurador Embutido'
    }
  })
}

function validarEletronicos(resp, erros) {
  const eletronicos = resp.eletronicosList || []

  if (eletronicos.length === 0) {
    erros.eletronicosList = 'Adicione ao menos um eletrÃ´nico'
    return
  }

  eletronicos.forEach((eletronico, index) => {
    const config = ELETRONICOS_CONFIG.find((item) => item.tipo === eletronico.tipo) || { subtipos: [] }

    if (config.subtipos.length > 0 && !preenchido(eletronico.subtipo)) {
      erros[`eletronico_${index}_subtipo`] = 'ObrigatÃ³rio'
    }
    if (!preenchido(eletronico.largura_cm)) {
      erros[`eletronico_${index}_largura`] = 'ObrigatÃ³rio'
    }
    if (!preenchido(eletronico.altura_cm)) {
      erros[`eletronico_${index}_altura`] = 'ObrigatÃ³rio'
    }
  })
}

export function validarFormularioAmbiente(formType, resp) {
  const erros = {}

  if (['cozinha', 'banheiro', 'outros'].includes(formType)) {
    if (resp.granito === null) erros.granito = 'Selecione uma opÃ§Ã£o'
    if (resp.granito === true && resp.granitoadaptar === null) {
      erros.granitoadaptar = 'Selecione uma opÃ§Ã£o'
    }
  }

  if (['cozinha', 'outros'].includes(formType)) {
    if (resp.tanque === null) erros.tanque = 'Selecione uma opÃ§Ã£o'
    if (resp.tanque === true && resp.tanqueMoveis === null) {
      erros.tanqueMoveis = 'Selecione uma opÃ§Ã£o'
    }
    if (resp.eletrosDefined === null) erros.eletrosDefined = 'Selecione uma opÃ§Ã£o'
    if (resp.eletrosDefined === true) {
      validarEletros(resp, erros)
    }
  }

  if (['dormitorio', 'home', 'outros'].includes(formType)) {
    if (resp.tv === null) erros.tv = 'Selecione uma opÃ§Ã£o'
    if (resp.tv === true) {
      if (resp.tvPontoFinal === null) erros.tvPontoFinal = 'Selecione uma opÃ§Ã£o'
      if (!preenchido(resp.tv_polegadas)) erros.tv_polegadas = 'ObrigatÃ³rio'
    }

    if (resp.cortineiro === null) erros.cortineiro = 'Selecione uma opÃ§Ã£o'
    if (resp.cortineiro === true && resp.cortieneiroInstalado === null) {
      erros.cortieneiroInstalado = 'Selecione uma opÃ§Ã£o'
    }

    if (resp.rodape === null) erros.rodape = 'Selecione uma opÃ§Ã£o'
  }

  if (formType === 'dormitorio') {
    if (!preenchido(resp.tamanhoCama)) erros.tamanhoCama = 'Selecione o tamanho da cama'
  }

  if (['dormitorio', 'outros'].includes(formType) && resp.tamanhoCama === 'outro') {
    if (!preenchido(resp.camaLargura_cm)) erros.camaLargura_cm = 'ObrigatÃ³rio'
    if (!preenchido(resp.camaComprimento_cm)) erros.camaComprimento_cm = 'ObrigatÃ³rio'
  }

  if (formType === 'banheiro' && !preenchido(resp.cuba)) {
    erros.cuba = 'Selecione o tipo de cuba'
  }

  if (['home', 'outros'].includes(formType)) {
    if (resp.eletronicos === null) erros.eletronicos = 'Selecione uma opÃ§Ã£o'
    if (resp.eletronicos === true) {
      validarEletronicos(resp, erros)
    }
  }

  return erros
}
