import m from './node_modules/jspdf/dist/jspdf.node.min.js'
const jsPDF = m.jsPDF || (m.default && m.default.jsPDF) || m
export { jsPDF }
export default jsPDF
