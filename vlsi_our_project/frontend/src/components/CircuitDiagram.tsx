import { useEffect, useRef } from 'react'

interface CircuitDiagramProps {
  code: string
}

const CircuitDiagram = ({ code }: CircuitDiagramProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokeColor = '#38bdf8'
  const textColor = '#e2e8f0'
  const labelColor = '#94a3b8'
  const accentColor = '#22d3ee'
  const connectorRadius = 3.5

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Parse code to detect circuit type
    const circuitType = detectCircuitType(code)
    
    // Draw circuit based on type
    drawCircuit(ctx, circuitType, canvas.width, canvas.height)
  }, [code])

  const detectCircuitType = (code: string): string => {
    const lowerCode = code.toLowerCase()
    const normalized = lowerCode.replace(/\s+/g, ' ')
    const compact = lowerCode.replace(/\s+/g, '')

    const hasModule = (name: string) => normalized.includes(`module ${name}`)
    const hasAssign = (expr: string) => normalized.includes(expr)
    const hasAssignCompact = (expr: string) => compact.includes(expr.replace(/\s+/g, ''))

    if (hasModule('priority_encoder_4to2') || lowerCode.includes('encoder_4to2') || lowerCode.includes('priority_encoder')) {
      return 'encoder_4to2'
    }
    if (hasModule('decoder_1to4') || lowerCode.includes('decoder 1:4') || lowerCode.includes('decoder1to4') || lowerCode.includes('demux1to4')) {
      return 'decoder_1to4'
    }
    if (hasModule('decoder_2to4') || lowerCode.includes('decoder 2:4')) {
      return 'decoder_2to4'
    }
    if (
      hasModule('simple_alu') ||
      (lowerCode.includes('alu') && (lowerCode.includes('op') || lowerCode.includes('operation')))
    ) {
      return 'alu_simple'
    }
    if (
      lowerCode.includes('comparator2') ||
      lowerCode.includes('2-bit comparator') ||
      lowerCode.includes('2bit comparator') ||
      hasModule('comparator_2bit')
    ) {
      return 'comparator_2bit'
    }
    if (lowerCode.includes('comparator') || lowerCode.includes('compare')) {
      return 'comparator_4bit'
    }
    if (
      lowerCode.includes('4:1 mux') ||
      lowerCode.includes('mux4to1') ||
      lowerCode.includes('4to1 mux') ||
      hasModule('mux4to1')
    ) {
      return 'mux_4to1'
    }
    if (lowerCode.includes('mux')) {
      return 'mux'
    }

    if (
      hasModule('xnor_gate') ||
      hasAssign('assign y = ~(a ^ b)') ||
      hasAssign('assign y = ~(a^b)') ||
      hasAssign('assign y = a ~^ b') ||
      hasAssignCompact('assign y=a~^b')
    ) {
      return 'xnor'
    }

    if (
      hasModule('xor_gate') ||
      hasAssign('assign y = a ^ b') ||
      hasAssign('assign y = a^b') ||
      hasAssignCompact('assign y=a^b') ||
      hasAssignCompact('assigny=a^b')
    ) {
      return 'xor'
    }

    if (
      hasModule('nand_gate') ||
      hasAssign('assign y = ~(a & b)') ||
      hasAssign('assign y = ~(a&b)') ||
      hasAssignCompact('assigny=~(a&b)')
    ) {
      return 'nand'
    }

    if (
      hasModule('nor_gate') ||
      hasAssign('assign y = ~(a | b)') ||
      hasAssign('assign y = ~(a|b)') ||
      hasAssignCompact('assigny=~(a|b)')
    ) {
      return 'nor'
    }

    if (hasModule('and_gate') || hasAssign('assign y = a & b') || hasAssignCompact('assigny=a&b')) {
      return 'and'
    }

    if (hasModule('or_gate') || hasAssign('assign y = a | b') || hasAssignCompact('assigny=a|b')) {
      return 'or'
    }

    if (hasModule('not_gate') || lowerCode.includes('~a')) {
      return 'not'
    }

    if (lowerCode.includes('d flip') || hasModule('d_flipflop') || hasModule('dff')) {
      return 'd_flipflop'
    }
    if (lowerCode.includes('d latch') || hasModule('d_latch') || lowerCode.includes('transparent latch')) {
      return 'd_latch'
    }
    if (lowerCode.includes('sr latch') || hasModule('sr_latch') || lowerCode.includes('set reset latch')) {
      return 'sr_latch'
    }
    if (lowerCode.includes('jk flip') || hasModule('jk_flipflop') || hasModule('jkff')) {
      return 'jk_flipflop'
    }
    if (lowerCode.includes('t flip') || hasModule('t_flipflop') || hasModule('tff')) {
      return 't_flipflop'
    }

    if (lowerCode.includes('up down counter') || hasModule('up_down_counter')) {
      return 'counter_updown'
    }
    if (lowerCode.includes('4-bit counter') || lowerCode.includes('4bit counter') || hasModule('counter4')) {
      return 'counter_4bit'
    }

    if (lowerCode.includes('fsm') || (lowerCode.includes('state') && lowerCode.includes('next_state'))) {
      return 'fsm_template'
    }

    if (lowerCode.includes('half_adder')) {
      return 'half_adder'
    }
    if (lowerCode.includes('full_adder')) {
      return 'full_adder'
    }

    return 'unknown'
  }

  const drawCircuit = (ctx: CanvasRenderingContext2D, type: string, width: number, height: number) => {
    ctx.strokeStyle = strokeColor
    ctx.fillStyle = strokeColor
    ctx.lineWidth = 2.5
    ctx.font = '16px "Segoe UI", sans-serif'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    const centerX = width / 2
    const centerY = height / 2

    drawTitle(ctx, type, centerX, 36)

    switch (type) {
      case 'and':
        drawANDGate(ctx, centerX, centerY)
        break
      case 'or':
        drawORGate(ctx, centerX, centerY)
        break
      case 'not':
        drawNOTGate(ctx, centerX, centerY)
        break
      case 'nand':
        drawNANDGate(ctx, centerX, centerY)
        break
      case 'nor':
        drawNORGate(ctx, centerX, centerY)
        break
      case 'xor':
        drawXORGate(ctx, centerX, centerY)
        break
      case 'xnor':
        drawXNORGate(ctx, centerX, centerY)
        break
      case 'half_adder':
        drawHalfAdder(ctx, centerX, centerY)
        break
      case 'full_adder':
        drawFullAdder(ctx, centerX, centerY)
        break
      case 'encoder_4to2':
        drawPriorityEncoder4to2(ctx, centerX, centerY)
        break
      case 'decoder_2to4':
        drawDecoder2to4(ctx, centerX, centerY)
        break
      case 'decoder_1to4':
        drawDecoder1to4(ctx, centerX, centerY)
        break
      case 'alu_simple':
        drawSimpleALU(ctx, centerX, centerY)
        break
      case 'comparator_2bit':
        drawComparator2Bit(ctx, centerX, centerY)
        break
      case 'comparator_4bit':
        draw4BitComparator(ctx, centerX, centerY)
        break
      case 'd_flipflop':
        drawDFlipFlop(ctx, centerX, centerY)
        break
      case 'd_latch':
        drawDLatch(ctx, centerX, centerY)
        break
      case 'sr_latch':
        drawSRLatch(ctx, centerX, centerY)
        break
      case 'jk_flipflop':
        drawJKFlipFlop(ctx, centerX, centerY)
        break
      case 't_flipflop':
        drawTFlipFlop(ctx, centerX, centerY)
        break
      case 'counter_4bit':
        drawCounter4Bit(ctx, centerX, centerY)
        break
      case 'counter_updown':
        drawCounterUpDown(ctx, centerX, centerY)
        break
      case 'fsm_template':
        drawFSMTemplate(ctx, centerX, centerY)
        break
      case 'mux':
        drawMultiplexer(ctx, centerX, centerY)
        break
      case 'mux_4to1':
        drawMultiplexer4to1(ctx, centerX, centerY)
        break
      default:
        drawPlaceholder(ctx, centerX, centerY)
    }
  }

  const drawTitle = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number) => {
    const titleMap: Record<string, string> = {
      and: 'AND Gate',
      or: 'OR Gate',
      not: 'NOT Gate',
      nand: 'NAND Gate',
      nor: 'NOR Gate',
      xor: 'XOR Gate',
      xnor: 'XNOR Gate',
      half_adder: 'Half Adder',
      full_adder: 'Full Adder',
      alu_simple: 'Simple ALU',
      comparator_2bit: '2-bit Comparator',
      encoder_4to2: 'Priority Encoder (4→2)',
      decoder_2to4: 'Decoder (2→4)',
      decoder_1to4: 'Decoder (1→4)',
      comparator_4bit: '4-bit Comparator',
      d_flipflop: 'D Flip-Flop',
      d_latch: 'Transparent D Latch',
      sr_latch: 'SR Latch',
      jk_flipflop: 'JK Flip-Flop',
      t_flipflop: 'T Flip-Flop',
      counter_4bit: '4-bit Counter',
      counter_updown: 'Up/Down Counter',
      fsm_template: 'FSM Template',
      mux: 'Multiplexer (2→1)',
      mux_4to1: 'Multiplexer (4→1)',
      unknown: 'Circuit Preview'
    }

    ctx.save()
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(titleMap[type] || 'Circuit Preview', x, y)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillStyle = '#64748b'
    ctx.fillText('Auto-generated logic diagram', x, y + 24)
    ctx.restore()
  }

  const drawDFlipFlop = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const width = 220
    const height = 160
    const leftX = x - width / 2
    const topY = y - height / 2
    const rightX = x + width / 2

    ctx.strokeRect(leftX, topY, width, height)

    // Body labels
    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('DFF', x, y - 20)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Positive edge triggered', x, y + 10)

    const inputX = leftX - 110
    const dY = y - 40
    const clkY = y + 40
    const qY = y - 40
    const qbY = y + 40
    const outputX = rightX + 110

    // D input
    ctx.beginPath()
    ctx.moveTo(inputX, dY)
    ctx.lineTo(leftX, dY)
    ctx.stroke()
    drawConnector(ctx, inputX, dY)
    drawConnector(ctx, leftX, dY)

    // Clock input with triangle
    ctx.beginPath()
    ctx.moveTo(inputX + 30, clkY - 12)
    ctx.lineTo(leftX, clkY - 12)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(leftX, clkY - 12)
    ctx.lineTo(leftX - 18, clkY)
    ctx.lineTo(leftX, clkY + 12)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(inputX, clkY)
    ctx.lineTo(leftX - 18, clkY)
    ctx.stroke()
    drawConnector(ctx, inputX, clkY)

    // Outputs Q and Q̅
    ctx.beginPath()
    ctx.moveTo(rightX, qY)
    ctx.lineTo(outputX, qY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(rightX, qbY)
    ctx.lineTo(outputX, qbY)
    ctx.stroke()

    drawConnector(ctx, outputX, qY)
    drawConnector(ctx, outputX, qbY)

    // Text labels
    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('D', inputX - 12, dY)
    ctx.fillText('CLK', inputX - 12, clkY)

    ctx.textAlign = 'left'
    ctx.fillText('Q', outputX + 12, qY)
    ctx.fillText('Q05', outputX + 12, qbY)

    ctx.restore()
  }

  const drawDLatch = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const width = 220
    const height = 140
    const leftX = x - width / 2
    const topY = y - height / 2
    const rightX = x + width / 2

    ctx.strokeRect(leftX, topY, width, height)

    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('D Latch', x, y - 10)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Level sensitive', x, y + 18)

    const inputX = leftX - 100
    const dY = y - 25
    const enY = y + 35
    const outputX = rightX + 100

    // Data input
    ctx.beginPath()
    ctx.moveTo(inputX, dY)
    ctx.lineTo(leftX, dY)
    ctx.stroke()
    drawConnector(ctx, inputX, dY)
    drawConnector(ctx, leftX, dY)

    // Enable input arrow
    ctx.beginPath()
    ctx.moveTo(inputX, enY)
    ctx.lineTo(leftX - 18, enY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftX - 18, enY - 10)
    ctx.lineTo(leftX, enY)
    ctx.lineTo(leftX - 18, enY + 10)
    ctx.stroke()
    drawConnector(ctx, inputX, enY)

    // Outputs
    ctx.beginPath()
    ctx.moveTo(rightX, y - 20)
    ctx.lineTo(outputX, y - 20)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(rightX, y + 20)
    ctx.lineTo(outputX, y + 20)
    ctx.stroke()

    drawConnector(ctx, outputX, y - 20)
    drawConnector(ctx, outputX, y + 20)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('D', inputX - 12, dY)
    ctx.fillText('EN', inputX - 12, enY)

    ctx.textAlign = 'left'
    ctx.fillText('Q', outputX + 12, y - 20)
    ctx.fillText('Q05', outputX + 12, y + 20)

    ctx.restore()
  }

  const drawSRLatch = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const width = 230
    const height = 150
    const leftX = x - width / 2
    const topY = y - height / 2
    const rightX = x + width / 2

    ctx.strokeRect(leftX, topY, width, height)

    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('SR Latch', x, y - 15)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Cross-coupled NOR', x, y + 15)

    const inputX = leftX - 100
    const outputX = rightX + 100

    const sY = y - 35
    const rY = y + 35

    // Inputs S and R
    ctx.beginPath()
    ctx.moveTo(inputX, sY)
    ctx.lineTo(leftX, sY)
    ctx.stroke()
    drawConnector(ctx, inputX, sY)
    drawConnector(ctx, leftX, sY)

    ctx.beginPath()
    ctx.moveTo(inputX, rY)
    ctx.lineTo(leftX, rY)
    ctx.stroke()
    drawConnector(ctx, inputX, rY)
    drawConnector(ctx, leftX, rY)

    // Internal cross-coupling lines
    ctx.strokeStyle = '#1e293b'
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(leftX + 40, sY)
    ctx.lineTo(rightX - 40, rY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(leftX + 40, rY)
    ctx.lineTo(rightX - 40, sY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = strokeColor

    // Outputs
    ctx.beginPath()
    ctx.moveTo(rightX, sY)
    ctx.lineTo(outputX, sY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(rightX, rY)
    ctx.lineTo(outputX, rY)
    ctx.stroke()

    drawConnector(ctx, outputX, sY)
    drawConnector(ctx, outputX, rY)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('S', inputX - 12, sY)
    ctx.fillText('R', inputX - 12, rY)

    ctx.textAlign = 'left'
    ctx.fillText('Q', outputX + 12, sY)
    ctx.fillText('Q05', outputX + 12, rY)

    ctx.restore()
  }

  const drawJKFlipFlop = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const width = 240
    const height = 170
    const leftX = x - width / 2
    const topY = y - height / 2
    const rightX = x + width / 2

    ctx.strokeRect(leftX, topY, width, height)

    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('JK Flip-Flop', x, y - 25)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Toggle on J=K=1', x, y + 5)

    const inputX = leftX - 110
    const outputX = rightX + 110

    const jY = y - 50
    const kY = y + 50
    const clkY = y
    const qY = y - 45
    const qbY = y + 45

    ctx.beginPath()
    ctx.moveTo(inputX, jY)
    ctx.lineTo(leftX, jY)
    ctx.stroke()
    drawConnector(ctx, inputX, jY)
    drawConnector(ctx, leftX, jY)

    ctx.beginPath()
    ctx.moveTo(inputX, kY)
    ctx.lineTo(leftX, kY)
    ctx.stroke()
    drawConnector(ctx, inputX, kY)
    drawConnector(ctx, leftX, kY)

    // Clock triangle
    ctx.beginPath()
    ctx.moveTo(inputX + 40, clkY - 12)
    ctx.lineTo(leftX, clkY - 12)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftX, clkY - 12)
    ctx.lineTo(leftX - 18, clkY)
    ctx.lineTo(leftX, clkY + 12)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(inputX, clkY)
    ctx.lineTo(leftX - 18, clkY)
    ctx.stroke()
    drawConnector(ctx, inputX, clkY)

    // Outputs
    ctx.beginPath()
    ctx.moveTo(rightX, qY)
    ctx.lineTo(outputX, qY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(rightX, qbY)
    ctx.lineTo(outputX, qbY)
    ctx.stroke()

    drawConnector(ctx, outputX, qY)
    drawConnector(ctx, outputX, qbY)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('J', inputX - 12, jY)
    ctx.fillText('K', inputX - 12, kY)
    ctx.fillText('CLK', inputX - 12, clkY)

    ctx.textAlign = 'left'
    ctx.fillText('Q', outputX + 12, qY)
    ctx.fillText('Q05', outputX + 12, qbY)

    ctx.restore()
  }

  const drawTFlipFlop = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const width = 220
    const height = 150
    const leftX = x - width / 2
    const topY = y - height / 2
    const rightX = x + width / 2

    ctx.strokeRect(leftX, topY, width, height)

    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('T Flip-Flop', x, y - 20)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Toggle when T=1', x, y + 10)

    const inputX = leftX - 100
    const outputX = rightX + 100

    const tY = y - 30
    const clkY = y + 30
    const qY = y - 25
    const qbY = y + 25

    ctx.beginPath()
    ctx.moveTo(inputX, tY)
    ctx.lineTo(leftX, tY)
    ctx.stroke()
    drawConnector(ctx, inputX, tY)
    drawConnector(ctx, leftX, tY)

    // Clock triangle
    ctx.beginPath()
    ctx.moveTo(inputX, clkY)
    ctx.lineTo(leftX - 18, clkY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftX - 18, clkY - 12)
    ctx.lineTo(leftX, clkY)
    ctx.lineTo(leftX - 18, clkY + 12)
    ctx.stroke()
    drawConnector(ctx, inputX, clkY)

    // Outputs
    ctx.beginPath()
    ctx.moveTo(rightX, qY)
    ctx.lineTo(outputX, qY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightX, qbY)
    ctx.lineTo(outputX, qbY)
    ctx.stroke()
    drawConnector(ctx, outputX, qY)
    drawConnector(ctx, outputX, qbY)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('T', inputX - 12, tY)
    ctx.fillText('CLK', inputX - 12, clkY)

    ctx.textAlign = 'left'
    ctx.fillText('Q', outputX + 12, qY)
    ctx.fillText('Q05', outputX + 12, qbY)

    ctx.restore()
  }

  const drawCounter4Bit = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const width = 360
    const height = 150
    const leftX = x - width / 2
    const topY = y - height / 2
    const rightX = x + width / 2

    ctx.strokeRect(leftX, topY, width, height)

    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('Synchronous 4-bit Counter', x, topY + 28)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Ripple-free, increment each clock', x, topY + 56)

    const inputX = leftX - 110
    const clkY = y + height / 2 - 25
    const outputX = rightX + 120

    // Clock input
    ctx.beginPath()
    ctx.moveTo(inputX, clkY)
    ctx.lineTo(leftX - 18, clkY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftX - 18, clkY - 12)
    ctx.lineTo(leftX, clkY)
    ctx.lineTo(leftX - 18, clkY + 12)
    ctx.stroke()
    drawConnector(ctx, inputX, clkY)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('CLK', inputX - 12, clkY)

    // Internal bit cells
    const cellWidth = 70
    const cellSpacing = 20
    const cellTop = y - 20

    for (let i = 0; i < 4; i++) {
      const cellX = leftX + 30 + i * (cellWidth + cellSpacing)
      ctx.strokeRect(cellX, cellTop, cellWidth, 60)
      ctx.fillStyle = strokeColor
      ctx.textAlign = 'center'
      ctx.font = '16px "Segoe UI Semibold", sans-serif'
      ctx.fillText(`Q${3 - i}`, cellX + cellWidth / 2, cellTop + 22)
      ctx.font = '12px "Segoe UI", sans-serif'
      ctx.fillText('Flip-Flop', cellX + cellWidth / 2, cellTop + 42)

      if (i < 3) {
        ctx.beginPath()
        ctx.moveTo(cellX + cellWidth, cellTop + 30)
        ctx.lineTo(cellX + cellWidth + cellSpacing, cellTop + 30)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cellX + cellWidth + cellSpacing - 8, cellTop + 24)
        ctx.lineTo(cellX + cellWidth + cellSpacing, cellTop + 30)
        ctx.lineTo(cellX + cellWidth + cellSpacing - 8, cellTop + 36)
        ctx.stroke()
      }
    }

    // Output bus
    ctx.beginPath()
    ctx.moveTo(rightX, y)
    ctx.lineTo(outputX, y)
    ctx.stroke()
    drawConnector(ctx, outputX, y)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'left'
    ctx.fillText('Count[3:0]', outputX + 14, y)

    ctx.restore()
  }

  const drawCounterUpDown = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const width = 360
    const height = 170
    const leftX = x - width / 2
    const topY = y - height / 2
    const rightX = x + width / 2

    ctx.strokeRect(leftX, topY, width, height)

    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('Up/Down Counter', x, topY + 28)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Direction selectable via Up/Down', x, topY + 56)

    const inputX = leftX - 120
    const outputX = rightX + 120

    const upY = y - 45
    const downY = y
    const clkY = y + 55

    // Up input
    ctx.beginPath()
    ctx.moveTo(inputX, upY)
    ctx.lineTo(leftX, upY)
    ctx.stroke()
    drawConnector(ctx, inputX, upY)
    drawConnector(ctx, leftX, upY)

    // Down input
    ctx.beginPath()
    ctx.moveTo(inputX, downY)
    ctx.lineTo(leftX, downY)
    ctx.stroke()
    drawConnector(ctx, inputX, downY)
    drawConnector(ctx, leftX, downY)

    // Clock triangle
    ctx.beginPath()
    ctx.moveTo(inputX, clkY)
    ctx.lineTo(leftX - 18, clkY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftX - 18, clkY - 12)
    ctx.lineTo(leftX, clkY)
    ctx.lineTo(leftX - 18, clkY + 12)
    ctx.stroke()
    drawConnector(ctx, inputX, clkY)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('Up', inputX - 12, upY)
    ctx.fillText('Down', inputX - 12, downY)
    ctx.fillText('CLK', inputX - 12, clkY)

    // Internal arrows
    ctx.strokeStyle = '#1e293b'
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(leftX + 40, y - 10)
    ctx.lineTo(rightX - 40, y - 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftX + 40, y + 20)
    ctx.lineTo(rightX - 40, y + 20)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = strokeColor

    // Output bus
    ctx.beginPath()
    ctx.moveTo(rightX, y + 5)
    ctx.lineTo(outputX, y + 5)
    ctx.stroke()
    drawConnector(ctx, outputX, y + 5)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'left'
    ctx.fillText('Count[3:0]', outputX + 14, y + 5)

    ctx.restore()
  }

  const drawFSMTemplate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.fillText('Finite State Machine Template', x, y - 140)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('States with labelled transitions', x, y - 115)

    // States positions
    const radius = 40
    const states = [
      { label: 'S0', x: x - 180, y: y },
      { label: 'S1', x: x, y: y - 40 },
      { label: 'S2', x: x + 180, y: y }
    ]

    states.forEach((state) => {
      ctx.beginPath()
      ctx.arc(state.x, state.y, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = strokeColor
      ctx.font = '18px "Segoe UI Semibold", sans-serif'
      ctx.fillText(state.label, state.x, state.y + 6)
    })

    // Self loop on S0
    ctx.beginPath()
    ctx.arc(states[0].x, states[0].y - radius - 20, 20, Math.PI * 0.2, Math.PI * 1.8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(states[0].x - 12, states[0].y - radius - 6)
    ctx.lineTo(states[0].x, states[0].y - radius - 20)
    ctx.lineTo(states[0].x + 12, states[0].y - radius - 6)
    ctx.stroke()

    ctx.fillStyle = labelColor
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('start', states[0].x, states[0].y - radius - 40)

    // Transition S0 -> S1
    ctx.beginPath()
    ctx.moveTo(states[0].x + radius, states[0].y)
    ctx.lineTo(states[1].x - radius, states[1].y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(states[1].x - radius + 6, states[1].y - 8)
    ctx.lineTo(states[1].x - radius, states[1].y)
    ctx.lineTo(states[1].x - radius + 6, states[1].y + 8)
    ctx.stroke()
    ctx.fillText('input=1', (states[0].x + states[1].x) / 2, states[1].y - 16)

    // Transition S1 -> S2
    ctx.beginPath()
    ctx.moveTo(states[1].x + radius, states[1].y)
    ctx.lineTo(states[2].x - radius, states[2].y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(states[2].x - radius + 6, states[2].y - 8)
    ctx.lineTo(states[2].x - radius, states[2].y)
    ctx.lineTo(states[2].x - radius + 6, states[2].y + 8)
    ctx.stroke()
    ctx.fillText('input=0', (states[1].x + states[2].x) / 2, states[1].y - 16)

    // Transition S2 -> S0
    ctx.beginPath()
    ctx.moveTo(states[2].x - 10, states[2].y + radius)
    ctx.bezierCurveTo(x + 60, y + 120, x - 60, y + 120, states[0].x + 10, states[0].y + radius)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(states[0].x + 20, states[0].y + radius - 8)
    ctx.lineTo(states[0].x + 10, states[0].y + radius)
    ctx.lineTo(states[0].x + 22, states[0].y + radius + 6)
    ctx.stroke()
    ctx.fillText('reset', x, y + 130)

    ctx.restore()
  }

  const drawConnector = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = accentColor
    ctx.strokeStyle = accentColor
    ctx.arc(x, y, connectorRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const drawANDGate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.fillStyle = labelColor
    // Input lines
    ctx.beginPath()
    ctx.moveTo(x - 80, y - 20)
    ctx.lineTo(x - 40, y - 20)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x - 80, y + 20)
    ctx.lineTo(x - 40, y + 20)
    ctx.stroke()

    // Gate body
    ctx.beginPath()
    ctx.moveTo(x - 40, y - 30)
    ctx.lineTo(x, y - 30)
    ctx.arc(x, y, 30, -Math.PI / 2, Math.PI / 2)
    ctx.lineTo(x - 40, y + 30)
    ctx.closePath()
    ctx.stroke()

    // Output line
    ctx.beginPath()
    ctx.moveTo(x + 30, y)
    ctx.lineTo(x + 70, y)
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('A', x - 95, y - 15)
    ctx.fillText('B', x - 95, y + 25)
    ctx.fillText('Y', x + 75, y + 5)
    ctx.fillStyle = strokeColor
    ctx.fillText('AND', x - 20, y + 5)
    drawConnector(ctx, x - 80, y - 20)
    drawConnector(ctx, x - 80, y + 20)
    drawConnector(ctx, x + 70, y)
    ctx.restore()
  }

  const drawORGate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Input lines
    ctx.beginPath()
    ctx.moveTo(x - 80, y - 20)
    ctx.lineTo(x - 50, y - 20)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x - 80, y + 20)
    ctx.lineTo(x - 50, y + 20)
    ctx.stroke()

    // Gate body (curved)
    ctx.beginPath()
    ctx.moveTo(x - 50, y - 30)
    ctx.quadraticCurveTo(x - 30, y - 30, x + 10, y - 15)
    ctx.quadraticCurveTo(x + 30, y, x + 10, y + 15)
    ctx.quadraticCurveTo(x - 30, y + 30, x - 50, y + 30)
    ctx.quadraticCurveTo(x - 40, y, x - 50, y - 30)
    ctx.stroke()

    // Output line
    ctx.beginPath()
    ctx.moveTo(x + 10, y)
    ctx.lineTo(x + 70, y)
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('A', x - 95, y - 15)
    ctx.fillText('B', x - 95, y + 25)
    ctx.fillText('Y', x + 75, y + 5)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('OR', x - 25, y + 5)
  }

  const drawNOTGate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Input line
    ctx.beginPath()
    ctx.moveTo(x - 80, y)
    ctx.lineTo(x - 40, y)
    ctx.stroke()

    // Triangle
    ctx.beginPath()
    ctx.moveTo(x - 40, y - 25)
    ctx.lineTo(x - 40, y + 25)
    ctx.lineTo(x + 10, y)
    ctx.closePath()
    ctx.stroke()

    // Bubble (inversion)
    ctx.beginPath()
    ctx.arc(x + 15, y, 5, 0, 2 * Math.PI)
    ctx.stroke()

    // Output line
    ctx.beginPath()
    ctx.moveTo(x + 20, y)
    ctx.lineTo(x + 70, y)
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('A', x - 95, y + 5)
    ctx.fillText('Y', x + 75, y + 5)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('NOT', x - 25, y + 5)
  }

  const drawNANDGate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw AND gate body
    ctx.beginPath()
    ctx.moveTo(x - 40, y - 30)
    ctx.lineTo(x, y - 30)
    ctx.arc(x, y, 30, -Math.PI / 2, Math.PI / 2)
    ctx.lineTo(x - 40, y + 30)
    ctx.closePath()
    ctx.stroke()
    
    // Input lines
    ctx.beginPath()
    ctx.moveTo(x - 80, y - 20)
    ctx.lineTo(x - 40, y - 20)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x - 80, y + 20)
    ctx.lineTo(x - 40, y + 20)
    ctx.stroke()
    
    // Add bubble for inversion
    ctx.beginPath()
    ctx.arc(x + 30, y, 5, 0, 2 * Math.PI)
    ctx.stroke()
    
    // Output line
    ctx.beginPath()
    ctx.moveTo(x + 35, y)
    ctx.lineTo(x + 70, y)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('A', x - 95, y - 15)
    ctx.fillText('B', x - 95, y + 25)
    ctx.fillText('Y', x + 75, y + 5)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('NAND', x - 30, y + 5)
  }

  const drawNORGate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw OR gate body
    ctx.beginPath()
    ctx.moveTo(x - 50, y - 30)
    ctx.quadraticCurveTo(x - 30, y - 30, x + 10, y - 15)
    ctx.quadraticCurveTo(x + 30, y, x + 10, y + 15)
    ctx.quadraticCurveTo(x - 30, y + 30, x - 50, y + 30)
    ctx.quadraticCurveTo(x - 40, y, x - 50, y - 30)
    ctx.stroke()
    
    // Input lines
    ctx.beginPath()
    ctx.moveTo(x - 80, y - 20)
    ctx.lineTo(x - 50, y - 20)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x - 80, y + 20)
    ctx.lineTo(x - 50, y + 20)
    ctx.stroke()
    
    // Add bubble for inversion
    ctx.beginPath()
    ctx.arc(x + 15, y, 5, 0, 2 * Math.PI)
    ctx.stroke()
    
    // Output line
    ctx.beginPath()
    ctx.moveTo(x + 20, y)
    ctx.lineTo(x + 70, y)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('A', x - 95, y - 15)
    ctx.fillText('B', x - 95, y + 25)
    ctx.fillText('Y', x + 75, y + 5)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('NOR', x - 25, y + 5)
  }

  const drawXORGate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // First curved line (part of OR gate)
    ctx.beginPath()
    ctx.moveTo(x - 50, y - 30)
    ctx.quadraticCurveTo(x - 30, y - 30, x + 10, y - 15)
    ctx.quadraticCurveTo(x + 30, y, x + 10, y + 15)
    ctx.quadraticCurveTo(x - 30, y + 30, x - 50, y + 30)
    ctx.quadraticCurveTo(x - 40, y, x - 50, y - 30)
    ctx.stroke()
    
    // Second curved line (extra curve for XOR)
    ctx.beginPath()
    ctx.moveTo(x - 60, y - 25)
    ctx.quadraticCurveTo(x - 40, y, x - 60, y + 25)
    ctx.stroke()
    
    // Input lines
    ctx.beginPath()
    ctx.moveTo(x - 80, y - 20)
    ctx.lineTo(x - 50, y - 20)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x - 80, y + 20)
    ctx.lineTo(x - 50, y + 20)
    ctx.stroke()
    
    // Output line
    ctx.beginPath()
    ctx.moveTo(x + 10, y)
    ctx.lineTo(x + 70, y)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('A', x - 95, y - 15)
    ctx.fillText('B', x - 95, y + 25)
    ctx.fillText('Y', x + 75, y + 5)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('XOR', x - 25, y + 5)
  }

  const drawXNORGate = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw XOR gate first
    // First curved line (part of OR gate)
    ctx.beginPath()
    ctx.moveTo(x - 50, y - 30)
    ctx.quadraticCurveTo(x - 30, y - 30, x + 5, y - 15)
    ctx.quadraticCurveTo(x + 25, y, x + 5, y + 15)
    ctx.quadraticCurveTo(x - 30, y + 30, x - 50, y + 30)
    ctx.quadraticCurveTo(x - 40, y, x - 50, y - 30)
    ctx.stroke()
    
    // Second curved line (extra curve for XOR)
    ctx.beginPath()
    ctx.moveTo(x - 60, y - 25)
    ctx.quadraticCurveTo(x - 40, y, x - 60, y + 25)
    ctx.stroke()
    
    // Add bubble for inversion
    ctx.beginPath()
    ctx.arc(x + 10, y, 5, 0, 2 * Math.PI)
    ctx.stroke()
    
    // Input lines
    ctx.beginPath()
    ctx.moveTo(x - 80, y - 20)
    ctx.lineTo(x - 50, y - 20)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(x - 80, y + 20)
    ctx.lineTo(x - 50, y + 20)
    ctx.stroke()
    
    // Output line
    ctx.beginPath()
    ctx.moveTo(x + 15, y)
    ctx.lineTo(x + 70, y)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('A', x - 95, y - 15)
    ctx.fillText('B', x - 95, y + 25)
    ctx.fillText('Y', x + 75, y + 5)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('XNOR', x - 30, y + 5)
  }

  const drawHalfAdder = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw XOR gate for Sum (smaller)
    const gateX = x - 80
    const andY = y + 60
    
    // XOR Gate (Sum)
    // First curved line (part of OR gate)
    ctx.beginPath()
    ctx.moveTo(gateX + 20, y - 30)
    ctx.quadraticCurveTo(gateX + 40, y - 30, gateX + 60, y - 15)
    ctx.quadraticCurveTo(gateX + 80, y, gateX + 60, y + 15)
    ctx.quadraticCurveTo(gateX + 40, y + 30, gateX + 20, y + 30)
    ctx.quadraticCurveTo(gateX + 30, y, gateX + 20, y - 30)
    ctx.stroke()
    
    // Second curved line (extra curve for XOR)
    ctx.beginPath()
    ctx.moveTo(gateX + 10, y - 25)
    ctx.quadraticCurveTo(gateX + 30, y, gateX + 10, y + 25)
    ctx.stroke()
    
    // AND Gate (Carry)
    ctx.beginPath()
    ctx.moveTo(gateX + 20, andY - 20)
    ctx.lineTo(gateX + 60, andY - 20)
    ctx.arc(gateX + 60, andY, 20, -Math.PI / 2, Math.PI / 2)
    ctx.lineTo(gateX + 20, andY + 20)
    ctx.closePath()
    ctx.stroke()
    
    // Input lines
    const inputX = x - 120
    
    // A input
    ctx.beginPath()
    ctx.moveTo(inputX, y - 10)
    ctx.lineTo(gateX + 20, y - 10)
    ctx.stroke()
    
    // B input
    ctx.beginPath()
    ctx.moveTo(inputX, y + 10)
    ctx.lineTo(gateX + 20, y + 10)
    ctx.stroke()
    
    // Connect A to AND gate
    ctx.beginPath()
    ctx.moveTo(inputX, y - 10)
    ctx.lineTo(inputX, andY - 10)
    ctx.lineTo(gateX + 20, andY - 10)
    ctx.stroke()
    
    // Connect B to AND gate
    ctx.beginPath()
    ctx.moveTo(inputX, y + 10)
    ctx.lineTo(inputX, andY + 10)
    ctx.lineTo(gateX + 20, andY + 10)
    ctx.stroke()
    
    // Sum output
    ctx.beginPath()
    ctx.moveTo(gateX + 80, y)
    ctx.lineTo(gateX + 120, y)
    ctx.stroke()
    
    // Carry output
    ctx.beginPath()
    ctx.moveTo(gateX + 80, andY)
    ctx.lineTo(gateX + 120, andY)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('A', inputX - 12, y - 4)
    ctx.fillText('B', inputX - 12, y + 18)
    ctx.textAlign = 'left'
    ctx.fillText('Sum', gateX + 128, y + 5)
    ctx.fillText('Carry', gateX + 128, andY + 5)
    
    // Gate labels
    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.fillText('XOR', gateX + 50, y + 5)
    ctx.fillText('AND', gateX + 50, andY + 5)

    drawConnector(ctx, inputX, y - 10)
    drawConnector(ctx, inputX, y + 10)
    drawConnector(ctx, gateX + 120, y)
    drawConnector(ctx, gateX + 120, andY)
  }

  const drawMultiplexer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5
    ctx.textBaseline = 'middle'

    const bodyWidth = 220
    const bodyHeight = 180
    const leftX = x - bodyWidth / 2
    const rightX = x + bodyWidth / 2
    const topY = y - bodyHeight / 2
    const bottomY = y + bodyHeight / 2

    // Multiplexer trapezoid body
    ctx.beginPath()
    ctx.moveTo(leftX, topY + 40)
    ctx.lineTo(rightX, topY)
    ctx.lineTo(rightX, bottomY)
    ctx.lineTo(leftX, bottomY - 40)
    ctx.closePath()
    ctx.stroke()

    const inputX = leftX - 130
    const outputX = rightX + 130
    const topInputY = y - 45
    const bottomInputY = y + 45
    const selectEntryY = bottomY + 70
    const junctionX = rightX - 55

    // Data input I0
    ctx.beginPath()
    ctx.moveTo(inputX, topInputY)
    ctx.lineTo(leftX, topInputY)
    ctx.lineTo(junctionX - 50, topInputY)
    ctx.lineTo(junctionX, y)
    ctx.stroke()
    drawConnector(ctx, inputX, topInputY)
    drawConnector(ctx, leftX, topInputY)

    // Data input I1
    ctx.beginPath()
    ctx.moveTo(inputX, bottomInputY)
    ctx.lineTo(leftX, bottomInputY)
    ctx.lineTo(junctionX - 50, bottomInputY)
    ctx.lineTo(junctionX, y)
    ctx.stroke()
    drawConnector(ctx, inputX, bottomInputY)
    drawConnector(ctx, leftX, bottomInputY)

    // Output line
    ctx.beginPath()
    ctx.moveTo(junctionX, y)
    ctx.lineTo(rightX, y)
    ctx.lineTo(outputX, y)
    ctx.stroke()
    drawConnector(ctx, outputX, y)

    // Selector input S
    ctx.beginPath()
    ctx.moveTo(x, selectEntryY)
    ctx.lineTo(x, bottomY - 10)
    ctx.lineTo(junctionX - 70, y)
    ctx.stroke()
    drawConnector(ctx, x, selectEntryY)

    // Control bubble at junction point
    ctx.beginPath()
    ctx.arc(junctionX - 70, y, 5, 0, Math.PI * 2)
    ctx.stroke()

    // Labels
    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.font = '16px "Segoe UI", sans-serif'
    ctx.fillText('I0', inputX - 12, topInputY)
    ctx.fillText('I1', inputX - 12, bottomInputY)
    ctx.fillText('S', x + 6, selectEntryY)

    ctx.textAlign = 'left'
    ctx.fillText('Y', outputX + 12, y)

    ctx.textAlign = 'center'
    ctx.fillStyle = strokeColor
    ctx.font = '18px "Segoe UI Semibold", sans-serif'
    ctx.fillText('2:1 Multiplexer', x, topY - 18)

    ctx.restore()
  }

  const drawSimpleALU = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const bodyWidth = 280
    const bodyHeight = 210
    const leftX = x - bodyWidth / 2
    const rightX = x + bodyWidth / 2
    const topY = y - bodyHeight / 2
    const bottomY = y + bodyHeight / 2

    ctx.beginPath()
    ctx.moveTo(leftX + 40, topY)
    ctx.lineTo(rightX, topY + 50)
    ctx.lineTo(rightX, bottomY - 50)
    ctx.lineTo(leftX + 40, bottomY)
    ctx.lineTo(leftX, bottomY - 35)
    ctx.lineTo(leftX, topY + 35)
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = '20px "Segoe UI Semibold", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Simple 4-bit ALU', x, topY - 30)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillStyle = labelColor
    ctx.fillText('Arithmetic · Logic · Flags', x, topY - 8)

    const inputX = leftX - 130
    const outputX = rightX + 150
    const controlX = x - 110

    const inputDefs = [
      { label: 'A[3:0]', y: y - 55 },
      { label: 'B[3:0]', y: y + 55 },
    ]

    inputDefs.forEach(({ label, y: pos }) => {
      ctx.beginPath()
      ctx.moveTo(inputX, pos)
      ctx.lineTo(leftX, pos)
      ctx.stroke()
      drawConnector(ctx, inputX, pos)
      drawConnector(ctx, leftX, pos)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'right'
      ctx.fillText(label, inputX - 12, pos)
    })

    const subBlockHeight = bodyHeight / 3
    const blockNames = [
      { title: 'Adder / Subtractor', details: 'Ripple + Carry control', offset: -subBlockHeight },
      { title: 'Logic Unit', details: 'AND · OR · XOR', offset: 0 },
      { title: 'Flag Unit', details: 'Zero · Carry · Overflow', offset: subBlockHeight },
    ]

    blockNames.forEach(({ title, details, offset }) => {
      const blockY = y + offset / 2
      const blockTop = blockY - subBlockHeight / 2 + 14
      const blockBottom = blockY + subBlockHeight / 2 - 14

      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 1.5
      ctx.setLineDash([8, 6])
      ctx.strokeRect(leftX + 35, blockTop, bodyWidth - 70, blockBottom - blockTop)
      ctx.setLineDash([])

      ctx.fillStyle = strokeColor
      ctx.textAlign = 'center'
      ctx.font = '17px "Segoe UI Semibold", sans-serif'
      ctx.fillText(title, x, blockTop + 22)
      ctx.font = '13px "Segoe UI", sans-serif'
      ctx.fillStyle = labelColor
      ctx.fillText(details, x, blockTop + 44)
    })

    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(controlX, bottomY + 60)
    ctx.lineTo(x - 10, bottomY - 10)
    ctx.lineTo(x + 40, y + 30)
    ctx.stroke()
    drawConnector(ctx, controlX, bottomY + 60)
    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('Op[1:0]', controlX - 12, bottomY + 60)

    ctx.beginPath()
    ctx.moveTo(rightX, y - 20)
    ctx.lineTo(outputX, y - 20)
    ctx.stroke()
    drawConnector(ctx, outputX, y - 20)
    ctx.fillStyle = labelColor
    ctx.textAlign = 'left'
    ctx.fillText('Result[3:0]', outputX + 14, y - 20)

    ctx.beginPath()
    ctx.moveTo(rightX, y + 30)
    ctx.lineTo(outputX, y + 30)
    ctx.stroke()
    drawConnector(ctx, outputX, y + 30)
    ctx.fillText('Carry', outputX + 14, y + 30)

    ctx.beginPath()
    ctx.moveTo(rightX, y + 70)
    ctx.lineTo(outputX, y + 70)
    ctx.stroke()
    drawConnector(ctx, outputX, y + 70)
    ctx.fillText('Zero', outputX + 14, y + 70)

    ctx.restore()
  }

  const drawComparator2Bit = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const stageWidth = 140
    const stageHeight = 90
    const stageCenterX = x - 110
    const decisionCenterX = x + 140
    const inputX = stageCenterX - 170
    const outputX = decisionCenterX + 170
    const upperStageY = y - 60
    const lowerStageY = y + 45

    const stageLeft = stageCenterX - stageWidth / 2
    const stageRight = stageCenterX + stageWidth / 2
    const decisionLeft = decisionCenterX - stageWidth / 2
    const decisionRight = decisionCenterX + stageWidth / 2

    const decisionTop = y - 34
    const decisionMid = y
    const decisionBottom = y + 34

    // MSB compare block
    ctx.strokeRect(stageLeft, upperStageY - stageHeight / 2, stageWidth, stageHeight)
    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '16px "Segoe UI Semibold", sans-serif'
    ctx.fillText('MSB Compare', stageCenterX, upperStageY - 10)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('GT1 / LT1', stageCenterX, upperStageY + 12)
    ctx.fillText('EQ1', stageCenterX, upperStageY + 32)

    // LSB compare block
    ctx.strokeRect(stageLeft, lowerStageY - stageHeight / 2, stageWidth, stageHeight)
    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '16px "Segoe UI Semibold", sans-serif'
    ctx.fillText('LSB Compare', stageCenterX, lowerStageY - 10)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('GT0 / LT0', stageCenterX, lowerStageY + 12)
    ctx.fillText('EQ0', stageCenterX, lowerStageY + 32)

    // Decision logic block
    ctx.strokeRect(decisionLeft, y - stageHeight / 2, stageWidth, stageHeight)
    ctx.fillStyle = strokeColor
    ctx.textAlign = 'center'
    ctx.font = '16px "Segoe UI Semibold", sans-serif'
    ctx.fillText('Decision Logic', decisionCenterX, y - 5)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillText('Combine GT/LT/EQ', decisionCenterX, y + 20)

    // Inputs wiring
    const msbInputs = [
      { label: 'A1', sourceY: y - 90, targetY: upperStageY - 24 },
      { label: 'B1', sourceY: y - 50, targetY: upperStageY + 24 }
    ]

    msbInputs.forEach(({ label, sourceY, targetY }) => {
      ctx.beginPath()
      ctx.moveTo(inputX, sourceY)
      ctx.lineTo(stageLeft - 40, sourceY)
      ctx.lineTo(stageLeft - 40, targetY)
      ctx.lineTo(stageLeft, targetY)
      ctx.stroke()
      drawConnector(ctx, inputX, sourceY)
      drawConnector(ctx, stageLeft, targetY)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'right'
      ctx.fillText(label, inputX - 12, sourceY)
    })

    const lsbInputs = [
      { label: 'A0', sourceY: y + 20, targetY: lowerStageY - 24 },
      { label: 'B0', sourceY: y + 60, targetY: lowerStageY + 24 }
    ]

    lsbInputs.forEach(({ label, sourceY, targetY }) => {
      ctx.beginPath()
      ctx.moveTo(inputX, sourceY)
      ctx.lineTo(stageLeft - 40, sourceY)
      ctx.lineTo(stageLeft - 40, targetY)
      ctx.lineTo(stageLeft, targetY)
      ctx.stroke()
      drawConnector(ctx, inputX, sourceY)
      drawConnector(ctx, stageLeft, targetY)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'right'
      ctx.fillText(label, inputX - 12, sourceY)
    })

    // EQ1 feed from MSB to LSB top
    const lsbTopEntry = lowerStageY - stageHeight / 2
    ctx.beginPath()
    ctx.moveTo(stageRight, upperStageY + 4)
    ctx.lineTo(stageRight + 40, upperStageY + 4)
    ctx.lineTo(stageRight + 40, lsbTopEntry - 30)
    ctx.lineTo(stageCenterX, lsbTopEntry - 30)
    ctx.lineTo(stageCenterX, lsbTopEntry)
    ctx.stroke()
    drawConnector(ctx, stageRight, upperStageY + 4)
    drawConnector(ctx, stageCenterX, lsbTopEntry)

    // MSB outputs to decision (GT1 / LT1)
    const msbOutputs = [
      { fromY: upperStageY - 24, toY: decisionTop },
      { fromY: upperStageY + 24, toY: decisionBottom }
    ]

    msbOutputs.forEach(({ fromY, toY }) => {
      ctx.beginPath()
      ctx.moveTo(stageRight, fromY)
      ctx.lineTo(stageRight + 50, fromY)
      ctx.lineTo(stageRight + 50, toY)
      ctx.lineTo(decisionLeft, toY)
      ctx.stroke()
      drawConnector(ctx, stageRight, fromY)
      drawConnector(ctx, decisionLeft, toY)
    })

    // LSB outputs to decision (GT0 / EQ0 / LT0)
    const lsbOutputs = [
      { fromY: lowerStageY - 24, toY: decisionTop + 12 },
      { fromY: lowerStageY, toY: decisionMid },
      { fromY: lowerStageY + 24, toY: decisionBottom - 12 }
    ]

    lsbOutputs.forEach(({ fromY, toY }) => {
      ctx.beginPath()
      ctx.moveTo(stageRight, fromY)
      ctx.lineTo(stageRight + 50, fromY)
      ctx.lineTo(stageRight + 50, toY)
      ctx.lineTo(decisionLeft, toY)
      ctx.stroke()
      drawConnector(ctx, stageRight, fromY)
      drawConnector(ctx, decisionLeft, toY)
    })

    // Outputs from decision block
    const outputs = [
      { label: 'A > B', y: decisionTop },
      { label: 'A = B', y: decisionMid },
      { label: 'A < B', y: decisionBottom }
    ]

    outputs.forEach(({ label, y: pos }) => {
      ctx.beginPath()
      ctx.moveTo(decisionRight, pos)
      ctx.lineTo(outputX, pos)
      ctx.stroke()
      drawConnector(ctx, decisionRight, pos)
      drawConnector(ctx, outputX, pos)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'left'
      ctx.fillText(label, outputX + 14, pos)
    })

    ctx.restore()
  }

  const drawDecoder1to4 = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const bodyWidth = 200
    const bodyHeight = 170
    const leftX = x - bodyWidth / 2
    const rightX = x + bodyWidth / 2
    const topY = y - bodyHeight / 2
    const bottomY = y + bodyHeight / 2

    ctx.beginPath()
    ctx.moveTo(leftX + 20, topY)
    ctx.lineTo(rightX, topY + 45)
    ctx.lineTo(rightX, bottomY - 45)
    ctx.lineTo(leftX + 20, bottomY)
    ctx.lineTo(leftX, bottomY - 25)
    ctx.lineTo(leftX, topY + 25)
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.font = '18px "Segoe UI Semibold", sans-serif'
    ctx.fillText('1-to-4 Decoder', x, topY - 24)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillStyle = labelColor
    ctx.fillText('Enable routed by S1 / S0', x, topY - 6)

    const inputX = leftX - 110
    const outputX = rightX + 110
    const enableY = y
    const outputYs = [y - 60, y - 20, y + 20, y + 60]

    ctx.beginPath()
    ctx.moveTo(inputX, enableY)
    ctx.lineTo(leftX, enableY)
    ctx.stroke()
    drawConnector(ctx, inputX, enableY)
    drawConnector(ctx, leftX, enableY)
    ctx.fillStyle = labelColor
    ctx.textAlign = 'right'
    ctx.fillText('Enable', inputX - 12, enableY)

    ;['S1', 'S0'].forEach((label, idx) => {
      const posX = x - 40 + idx * 60
      const startY = bottomY + 50

      ctx.beginPath()
      ctx.moveTo(posX, startY)
      ctx.lineTo(posX, bottomY - 10)
      ctx.lineTo(leftX + 30, bottomY - 10 - idx * 20)
      ctx.stroke()

      drawConnector(ctx, posX, startY)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'center'
      ctx.fillText(label, posX, startY + 18)
    })

    outputYs.forEach((pos, idx) => {
      ctx.beginPath()
      ctx.moveTo(rightX, pos)
      ctx.lineTo(outputX, pos)
      ctx.stroke()
      drawConnector(ctx, rightX, pos)
      drawConnector(ctx, outputX, pos)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'left'
      ctx.fillText(`Y${idx}`, outputX + 12, pos)
    })

    ctx.restore()
  }

  const drawMultiplexer4to1 = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5
    ctx.textBaseline = 'middle'

    const bodyWidth = 220
    const bodyHeight = 180
    const leftX = x - bodyWidth / 2
    const rightX = x + bodyWidth / 2
    const topY = y - bodyHeight / 2
    const bottomY = y + bodyHeight / 2

    ctx.beginPath()
    ctx.moveTo(leftX, topY + 40)
    ctx.lineTo(rightX, topY)
    ctx.lineTo(rightX, bottomY)
    ctx.lineTo(leftX, bottomY - 40)
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = '18px "Segoe UI Semibold", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('4:1 Multiplexer', x, topY - 28)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillStyle = labelColor
    ctx.fillText('Four inputs → one output', x, topY - 8)

    const inputX = leftX - 120
    const outputX = rightX + 130
    const innerLeftX = x - bodyWidth / 6
    const innerRightX = x + bodyWidth / 8
    const upperJunctionY = y - 35
    const lowerJunctionY = y + 35

    const inputYs = [y - 70, y - 25, y + 25, y + 70]
    inputYs.forEach((pos, idx) => {
      ctx.beginPath()
      ctx.moveTo(inputX, pos)
      ctx.lineTo(leftX, pos)

      const targetY = idx < 2 ? upperJunctionY : lowerJunctionY
      ctx.lineTo(innerLeftX, targetY)
      ctx.stroke()

      drawConnector(ctx, inputX, pos)
      drawConnector(ctx, leftX, pos)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'right'
      ctx.fillText(`I${idx}`, inputX - 12, pos)
    })

    // Merge upper pair
    ctx.beginPath()
    ctx.moveTo(innerLeftX, upperJunctionY)
    ctx.lineTo(innerRightX, upperJunctionY)
    ctx.stroke()

    // Merge lower pair
    ctx.beginPath()
    ctx.moveTo(innerLeftX, lowerJunctionY)
    ctx.lineTo(innerRightX, lowerJunctionY)
    ctx.stroke()

    // Combine to single output
    ctx.beginPath()
    ctx.moveTo(innerRightX, upperJunctionY)
    ctx.lineTo(innerRightX + 25, y)
    ctx.lineTo(rightX - 20, y)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(innerRightX, lowerJunctionY)
    ctx.lineTo(innerRightX + 25, y)
    ctx.stroke()

    // Output line and label
    ctx.beginPath()
    ctx.moveTo(rightX - 20, y)
    ctx.lineTo(outputX, y)
    ctx.stroke()
    drawConnector(ctx, outputX, y)
    ctx.fillStyle = labelColor
    ctx.textAlign = 'left'
    ctx.fillText('Y', outputX + 12, y)

    // Selector inputs (S1, S0) entering from bottom
    const selectSpacing = 45
    ;['S1', 'S0'].forEach((label, idx) => {
      const posX = x - 25 + idx * selectSpacing
      const startY = bottomY + 55

      ctx.beginPath()
      ctx.moveTo(posX, startY)
      ctx.lineTo(posX, bottomY)
      ctx.lineTo(posX, bottomY - 10)
      ctx.lineTo(x - 10, bottomY - 10)
      ctx.lineTo(x + 15, y + 25)
      ctx.stroke()

      drawConnector(ctx, posX, startY)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'center'
      ctx.fillText(label, posX, startY + 18)
    })

    // Enable input (optional) dotted line indicator
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(x - bodyWidth / 4, bottomY - 10)
    ctx.lineTo(x - bodyWidth / 4, bottomY + 35)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.restore()
  }

  const drawFullAdder = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5
    ctx.textBaseline = 'middle'

    const blockWidth = 140
    const blockHeight = 84
    const blockRadius = 16

    const halfAdder1 = { cx: x - 110, cy: y - 24 }
    const halfAdder2 = { cx: x + 70, cy: y - 24 }
    const orGate = { cx: x + 210, cy: y + 58 }

    const inputStartX = halfAdder1.cx - blockWidth / 2 - 120
    const sumOutX = halfAdder2.cx + blockWidth / 2 + 130
    const coutOutX = orGate.cx + 120

    const aY = y - 72
    const bY = y - 8
    const cinY = y + 56

    const drawRoundedRect = (cx: number, cy: number, width: number, height: number) => {
      const left = cx - width / 2
      const top = cy - height / 2
      const right = cx + width / 2
      const bottom = cy + height / 2

      ctx.beginPath()
      ctx.moveTo(left + blockRadius, top)
      ctx.lineTo(right - blockRadius, top)
      ctx.quadraticCurveTo(right, top, right, top + blockRadius)
      ctx.lineTo(right, bottom - blockRadius)
      ctx.quadraticCurveTo(right, bottom, right - blockRadius, bottom)
      ctx.lineTo(left + blockRadius, bottom)
      ctx.quadraticCurveTo(left, bottom, left, bottom - blockRadius)
      ctx.lineTo(left, top + blockRadius)
      ctx.quadraticCurveTo(left, top, left + blockRadius, top)
      ctx.closePath()
      ctx.stroke()
    }

    const drawORBubble = (cx: number, cy: number) => {
      ctx.beginPath()
      ctx.moveTo(cx - 60, cy - 40)
      ctx.quadraticCurveTo(cx, cy - 60, cx + 60, cy)
      ctx.quadraticCurveTo(cx, cy + 60, cx - 60, cy + 40)
      ctx.closePath()
      ctx.stroke()
    }

    const labelCentered = (text: string, sub: string, cx: number, cy: number) => {
      ctx.save()
      ctx.textAlign = 'center'
      ctx.font = '16px "Segoe UI Semibold", sans-serif'
      ctx.fillStyle = textColor
      ctx.fillText(text, cx, cy - 12)
      if (sub) {
        ctx.font = '12px "Segoe UI", sans-serif'
        ctx.fillStyle = labelColor
        ctx.fillText(sub, cx, cy + 10)
      }
      ctx.restore()
    }

    const drawInputWire = (label: string, yPos: number, targetX: number, targetY: number) => {
      ctx.beginPath()
      ctx.moveTo(inputStartX, yPos)
      const settleX = targetX - blockWidth / 2 - 20
      ctx.lineTo(settleX, yPos)
      if (yPos !== targetY) {
        ctx.lineTo(settleX, targetY)
      }
      ctx.lineTo(targetX - blockWidth / 2, targetY)
      ctx.stroke()
      drawConnector(ctx, inputStartX, yPos)
      drawConnector(ctx, targetX - blockWidth / 2, targetY)

      ctx.fillStyle = labelColor
      ctx.font = '14px "Segoe UI", sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(label, inputStartX - 12, yPos)
    }

    // Half adder blocks
    drawRoundedRect(halfAdder1.cx, halfAdder1.cy, blockWidth, blockHeight)
    labelCentered('Half Adder 1', 'Inputs: A, B', halfAdder1.cx, halfAdder1.cy)

    drawRoundedRect(halfAdder2.cx, halfAdder2.cy, blockWidth, blockHeight)
    labelCentered('Half Adder 2', 'Inputs: sum₁, Cin', halfAdder2.cx, halfAdder2.cy)

    drawORBubble(orGate.cx, orGate.cy)
    labelCentered('Carry OR', 'cout = c₁ + c₂', orGate.cx, orGate.cy - 4)

    // Inputs into first half adder
    drawInputWire('A', aY, halfAdder1.cx, halfAdder1.cy - 18)
    drawInputWire('B', bY, halfAdder1.cx, halfAdder1.cy + 18)

    // Cin into second half adder
    drawInputWire('Cin', cinY, halfAdder2.cx, halfAdder2.cy + 22)

    // Output from HA1 to HA2 (sum)
    ctx.beginPath()
    ctx.moveTo(halfAdder1.cx + blockWidth / 2, halfAdder1.cy - 18)
    ctx.lineTo(halfAdder2.cx - blockWidth / 2 - 40, halfAdder1.cy - 18)
    ctx.lineTo(halfAdder2.cx - blockWidth / 2 - 40, halfAdder2.cy - 18)
    ctx.lineTo(halfAdder2.cx - blockWidth / 2, halfAdder2.cy - 18)
    ctx.stroke()
    drawConnector(ctx, halfAdder1.cx + blockWidth / 2, halfAdder1.cy - 18)
    drawConnector(ctx, halfAdder2.cx - blockWidth / 2, halfAdder2.cy - 18)

    ctx.save()
    ctx.fillStyle = labelColor
    ctx.font = '12px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('sum₁', halfAdder2.cx - blockWidth / 2 - 46, halfAdder2.cy - 32)
    ctx.restore()

    // Sum output to the right
    ctx.beginPath()
    ctx.moveTo(halfAdder2.cx + blockWidth / 2, halfAdder2.cy - 18)
    ctx.lineTo(sumOutX, halfAdder2.cy - 18)
    ctx.stroke()
    drawConnector(ctx, halfAdder2.cx + blockWidth / 2, halfAdder2.cy - 18)
    drawConnector(ctx, sumOutX, halfAdder2.cy - 18)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'left'
    ctx.font = '14px "Segoe UI", sans-serif'
    ctx.fillText('Sum', sumOutX + 12, halfAdder2.cy - 18)

    // Carry wires from half adders into OR
    ctx.beginPath()
    ctx.moveTo(halfAdder1.cx + blockWidth / 2, halfAdder1.cy + 18)
    ctx.lineTo(orGate.cx - 80, halfAdder1.cy + 18)
    ctx.lineTo(orGate.cx - 80, orGate.cy - 20)
    ctx.lineTo(orGate.cx - 60, orGate.cy - 20)
    ctx.stroke()
    drawConnector(ctx, halfAdder1.cx + blockWidth / 2, halfAdder1.cy + 18)
    drawConnector(ctx, orGate.cx - 60, orGate.cy - 20)

    ctx.beginPath()
    ctx.moveTo(halfAdder2.cx + blockWidth / 2, halfAdder2.cy + 18)
    ctx.lineTo(orGate.cx - 80, halfAdder2.cy + 18)
    ctx.lineTo(orGate.cx - 80, orGate.cy + 20)
    ctx.lineTo(orGate.cx - 60, orGate.cy + 20)
    ctx.stroke()
    drawConnector(ctx, halfAdder2.cx + blockWidth / 2, halfAdder2.cy + 18)
    drawConnector(ctx, orGate.cx - 60, orGate.cy + 20)

    ctx.save()
    ctx.fillStyle = labelColor
    ctx.font = '12px "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('c₁', orGate.cx - 92, orGate.cy - 28)
    ctx.fillText('c₂', orGate.cx - 92, orGate.cy + 28)
    ctx.restore()

    // Cout output
    ctx.beginPath()
    ctx.moveTo(orGate.cx + 70, orGate.cy)
    ctx.lineTo(coutOutX, orGate.cy)
    ctx.stroke()
    drawConnector(ctx, orGate.cx + 70, orGate.cy)
    drawConnector(ctx, coutOutX, orGate.cy)

    ctx.fillStyle = labelColor
    ctx.textAlign = 'left'
    ctx.font = '14px "Segoe UI", sans-serif'
    ctx.fillText('Cout', coutOutX + 12, orGate.cy)

    ctx.restore()
  }

  const drawPriorityEncoder4to2 = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw the encoder box
    const width = 120
    const height = 160
    
    // Main box
    ctx.strokeRect(x - width/2, y - height/2, width, height)
    
    // Inputs (4-bit)
    const inputY = [y-50, y-20, y+10, y+40]
    const inputLabels = ['D3', 'D2', 'D1', 'D0']
    
    inputY.forEach((yPos, i) => {
      // Input lines
      ctx.beginPath()
      ctx.moveTo(x - width/2 - 30, yPos)
      ctx.lineTo(x - width/2, yPos)
      ctx.stroke()
      
      // Input labels
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(inputLabels[i], x - width/2 - 50, yPos + 5)
    })
    
    // Outputs (2-bit + valid)
    const outputY = [y-30, y, y+30]
    const outputLabels = ['Y1', 'Y0', 'V']
    
    outputY.forEach((yPos, i) => {
      // Output lines
      ctx.beginPath()
      ctx.moveTo(x + width/2, yPos)
      ctx.lineTo(x + width/2 + 30, yPos)
      ctx.stroke()
      
      // Output labels
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(outputLabels[i], x + width/2 + 35, yPos + 5)
    })
    
    // Title
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('4:2 Priority', x - 30, y - 60)
    ctx.fillText('Encoder', x - 25, y - 40)
  }

  const drawDecoder2to4 = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 2.5

    const bodyWidth = 220
    const bodyHeight = 180
    const leftX = x - bodyWidth / 2
    const rightX = x + bodyWidth / 2
    const topY = y - bodyHeight / 2
    const bottomY = y + bodyHeight / 2

    ctx.beginPath()
    ctx.moveTo(leftX + 30, topY)
    ctx.lineTo(rightX, topY + 45)
    ctx.lineTo(rightX, bottomY - 45)
    ctx.lineTo(leftX + 30, bottomY)
    ctx.lineTo(leftX, bottomY - 30)
    ctx.lineTo(leftX, topY + 30)
    ctx.closePath()
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.font = '19px "Segoe UI Semibold", sans-serif'
    ctx.fillText('2-to-4 Decoder', x, topY - 26)
    ctx.font = '13px "Segoe UI", sans-serif'
    ctx.fillStyle = labelColor
    ctx.fillText('A1 A0 select → Y0..Y3', x, topY - 6)

    const inputX = leftX - 120
    const outputX = rightX + 120

    ;[
      { label: 'A1', y: y - 40 },
      { label: 'A0', y: y },
    ].forEach(({ label, y: pos }) => {
      ctx.beginPath()
      ctx.moveTo(inputX, pos)
      ctx.lineTo(leftX, pos)
      ctx.stroke()
      drawConnector(ctx, inputX, pos)
      drawConnector(ctx, leftX, pos)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'right'
      ctx.fillText(label, inputX - 12, pos)
    })

    const enableY = y + 50
    ctx.beginPath()
    ctx.moveTo(inputX, enableY)
    ctx.lineTo(leftX + 20, enableY)
    ctx.stroke()
    drawConnector(ctx, inputX, enableY)
    drawConnector(ctx, leftX + 20, enableY)
    ctx.fillText('Enable', inputX - 12, enableY)

    const outputYs = [y - 70, y - 25, y + 25, y + 70]
    outputYs.forEach((pos, idx) => {
      ctx.beginPath()
      ctx.moveTo(rightX, pos)
      ctx.lineTo(outputX, pos)
      ctx.stroke()
      drawConnector(ctx, rightX, pos)
      drawConnector(ctx, outputX, pos)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'left'
      ctx.fillText(`Y${idx}`, outputX + 12, pos)
    })

    ctx.restore()
  }

  const draw4BitComparator = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw the comparator box
    const width = 200
    const height = 120
    
    // Main box
    ctx.strokeRect(x - width/2, y - height/2, width, height)
    
    // Inputs (A and B 4-bit)
    const inputY = [y-40, y-20, y+20, y+40]
    const inputLabelsA = ['A3', 'A2', 'A1', 'A0']
    const inputLabelsB = ['B3', 'B2', 'B1', 'B0']
    
    inputY.forEach((yPos, i) => {
      // Input A lines
      ctx.beginPath()
      ctx.moveTo(x - width/2 - 40, yPos - 5)
      ctx.lineTo(x - width/2, yPos - 5)
      ctx.stroke()
      
      // Input B lines
      ctx.beginPath()
      ctx.moveTo(x - width/2 - 40, yPos + 5)
      ctx.lineTo(x - width/2, yPos + 5)
      ctx.stroke()
      
      // Input labels A
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(inputLabelsA[i], x - width/2 - 60, yPos - 2)
      
      // Input labels B
      ctx.fillText(inputLabelsB[i], x - width/2 - 60, yPos + 12)
    })
    
    // Outputs
    const outputY = [y-30, y, y+30]
    const outputLabels = ['A > B', 'A = B', 'A < B']
    
    outputY.forEach((yPos, i) => {
      // Output lines
      ctx.beginPath()
      ctx.moveTo(x + width/2, yPos)
      ctx.lineTo(x + width/2 + 40, yPos)
      ctx.stroke()
      
      // Output labels
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(outputLabels[i], x + width/2 + 45, yPos + 5)
    })
    
    // Title
    ctx.fillStyle = '#3b82f6'
    ctx.fillText('4-bit', x - 20, y - 50)
    ctx.fillText('Comparator', x - 35, y - 30)
  }

  const drawPlaceholder = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#64748b'
    ctx.font = '16px Arial'
    ctx.fillText('Write Verilog code to see circuit diagram', x - 150, y)
    
    // Show supported circuits
    ctx.font = '14px Arial'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('Supported circuits: AND, OR, NOT, NAND, NOR, XOR, XNOR', x - 180, y + 30)
    ctx.fillText('Half Adder, Full Adder, 4:2 Encoder, 2:4 Decoder, 4-bit Comparator', x - 200, y + 50)
  }

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        Logic Circuit Diagram
      </h3>
      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          width={1100}
          height={420}
          className="block min-w-[900px] h-[420px] bg-slate-800 rounded border border-slate-600"
        />
      </div>
    </div>
  )
}

export default CircuitDiagram
