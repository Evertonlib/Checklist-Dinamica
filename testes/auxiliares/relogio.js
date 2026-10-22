// Relógio fixo da suíte (Spec, seção 4.5): mock.timers do node:test, só para Date.
import { mock } from 'node:test'

// Montadas com partes locais ANTES de ligar o mock: meio-dia no fuso da máquina, o dia não vira.
export const DATA_19_10_2026 = new Date(2026, 9, 19, 12, 0, 0)
export const DATA_05_03_2026 = new Date(2026, 2, 5, 12, 0, 0)

export async function comRelogio(data, funcao) {
  mock.timers.enable({ apis: ['Date'], now: data.getTime() })
  try {
    // Confere o instante exato, não só o dia: com o mock desligado no mesmo dia, o dia bateria à toa.
    const agora = new Date().getTime()
    if (agora !== data.getTime()) {
      throw new Error(
        `Relógio fixo não ligou: esperado ${data.toISOString()}, obtido ${new Date(agora).toISOString()} ` +
          '(mock.timers sem suporte a Date neste Node?)'
      )
    }
    return await funcao()
  } finally {
    mock.timers.reset()
  }
}
