import m from './node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.js'
const autoTable = (typeof m === 'function' && m) || m.default || m.autoTable
export { autoTable }
export default autoTable
