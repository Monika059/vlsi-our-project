"""Central catalog of Verilog templates exposed via `/api/templates`."""


# ----------------------------------------------------------------------------
# Logic gates
# ----------------------------------------------------------------------------
BASIC_GATES = {
    "not_gate": {
        "name": "NOT Gate",
        "description": "Inverter gate built from a single NOT gate",
        "code": """// NOT Gate - Inverts the input
module not_gate(
    input a,
    output y
);
    assign y = ~a;
endmodule""",
        "testbench": """// Testbench for NOT Gate
module not_gate_tb;
    reg a;
    wire y;

    not_gate uut (.a(a), .y(y));

    initial begin
        $dumpfile(\"not_gate.vcd\");
        $dumpvars(0, not_gate_tb);

        $display(\"Time\\ta\\ty\");
        $display(\"-------------\");

        a = 0; #10; $display(\"%0t\\t%b\\t%b\", $time, a, y);
        a = 1; #10; $display(\"%0t\\t%b\\t%b\", $time, a, y);

        #10 $finish;
    end
endmodule"""
    },
    "and_gate": {
        "name": "AND Gate",
        "description": "2-input AND gate with exhaustive stimulus",
        "code": """// AND Gate - Output is 1 only when both inputs are 1
module and_gate(
    input a, b,
    output y
);
    assign y = a & b;
endmodule""",
        "testbench": """// Testbench for AND Gate
module and_gate_tb;
    reg a, b;
    wire y;

    and_gate uut (.a(a), .b(b), .y(y));

    integer i;

    initial begin
        $dumpfile(\"and_gate.vcd\");
        $dumpvars(0, and_gate_tb);

        $display(\"Time\\ta\\tb\\ty\");
        $display(\"-------------------\");

        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t%b\", $time, a, b, y);
        end

        #10 $finish;
    end
endmodule"""
    },
    "or_gate": {
        "name": "OR Gate",
        "description": "2-input OR gate with testbench",
        "code": """// OR Gate - Output is 1 when at least one input is 1
module or_gate(
    input a, b,
    output y
);
    assign y = a | b;
endmodule""",
        "testbench": """// Testbench for OR Gate
module or_gate_tb;
    reg a, b;
    wire y;

    or_gate uut (.a(a), .b(b), .y(y));

    integer i;

    initial begin
        $dumpfile(\"or_gate.vcd\");
        $dumpvars(0, or_gate_tb);

        $display(\"Time\\ta\\tb\\ty\");
        $display(\"-------------------\");

        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t%b\", $time, a, b, y);
        end

        #10 $finish;
    end
endmodule"""
    },
    "xor_gate": {
        "name": "XOR Gate",
        "description": "2-input XOR gate with testbench",
        "code": """// XOR Gate - Output is 1 when inputs are different
module xor_gate(
    input a, b,
    output y
);
    assign y = a ^ b;
endmodule""",
        "testbench": """// Testbench for XOR Gate
module xor_gate_tb;
    reg a, b;
    wire y;

    xor_gate uut (.a(a), .b(b), .y(y));

    integer i;

    initial begin
        $dumpfile(\"xor_gate.vcd\");
        $dumpvars(0, xor_gate_tb);

        $display(\"Time\\ta\\tb\\ty\");
        $display(\"-------------------\");

        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t%b\", $time, a, b, y);
        end

        #10 $finish;
    end
endmodule"""
    },
    "xnor_gate": {
        "name": "XNOR Gate",
        "description": "2-input XNOR gate with testbench",
        "code": """// XNOR Gate - Output is 1 when inputs are the same
module xnor_gate(
    input a, b,
    output y
);
    assign y = ~(a ^ b);
endmodule""",
        "testbench": """// Testbench for XNOR Gate
module xnor_gate_tb;
    reg a, b;
    wire y;

    xnor_gate uut (.a(a), .b(b), .y(y));

    integer i;

    initial begin
        $dumpfile(\"xnor_gate.vcd\");
        $dumpvars(0, xnor_gate_tb);

        $display(\"Time\\ta\\tb\\ty\");
        $display(\"-------------------\");

        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t%b\", $time, a, b, y);
        end

        #10 $finish;
    end
endmodule"""
    },
    "nand_gate": {
        "name": "NAND Gate",
        "description": "2-input NAND gate with testbench",
        "code": """// NAND Gate - Output is 0 only when both inputs are 1
module nand_gate(
    input a, b,
    output y
);
    assign y = ~(a & b);
endmodule""",
        "testbench": """// Testbench for NAND Gate
module nand_gate_tb;
    reg a, b;
    wire y;

    nand_gate uut (.a(a), .b(b), .y(y));

    integer i;

    initial begin
        $dumpfile(\"nand_gate.vcd\");
        $dumpvars(0, nand_gate_tb);

        $display(\"Time\\ta\\tb\\ty\");
        $display(\"-------------------\");

        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t%b\", $time, a, b, y);
        end

        #10 $finish;
    end
endmodule"""
    },
    "nor_gate": {
        "name": "NOR Gate",
        "description": "2-input NOR gate with testbench",
        "code": """// NOR Gate - Output is 1 only when both inputs are 0
module nor_gate(
    input a, b,
    output y
);
    assign y = ~(a | b);
endmodule""",
        "testbench": """// Testbench for NOR Gate
module nor_gate_tb;
    reg a, b;
    wire y;

    nor_gate uut (.a(a), .b(b), .y(y));

    integer i;

    initial begin
        $dumpfile(\"nor_gate.vcd\");
        $dumpvars(0, nor_gate_tb);

        $display(\"Time\\ta\\tb\\ty\");
        $display(\"-------------------\");

        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t%b\", $time, a, b, y);
        end

        #10 $finish;
    end
endmodule"""
    },
}


# ----------------------------------------------------------------------------
# Arithmetic and datapath blocks
# ----------------------------------------------------------------------------
ARITHMETIC = {
    "half_adder": {
        "name": "Half Adder",
        "description": "Adds two 1-bit numbers using XOR/AND combination",
        "code": """// Half Adder - Adds two 1-bit numbers
module half_adder(
    input a, b,
    output sum, carry
);
    assign sum   = a ^ b;
    assign carry = a & b;
endmodule""",
        "testbench": """// Testbench for Half Adder
module half_adder_tb;
    reg a, b;
    wire sum, carry;

    half_adder uut (.a(a), .b(b), .sum(sum), .carry(carry));

    integer i;

    initial begin
        $dumpfile(\"half_adder.vcd\");
        $dumpvars(0, half_adder_tb);

        $display(\"Time\\ta\\tb\\t|\\tSum\\tCarry\");
        $display(\"-----------------------------------\");

        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t|\\t%b\\t%b\", $time, a, b, sum, carry);
        end

        #10 $finish;
    end
endmodule"""
    },
    "full_adder": {
        "name": "Full Adder",
        "description": "Gate-level 1-bit full adder with structured wiring",
        "code": """// 1-bit Full Adder built from XOR, AND, and OR gates
module full_adder(
    input a, b,
    input cin,
    output sum,
    output cout
);
    wire p;      // Partial sum a XOR b
    wire g;      // Generate term a AND b
    wire t;      // Propagate AND carry in

    assign p = a ^ b;
    assign sum = p ^ cin;

    assign g = a & b;
    assign t = p & cin;
    assign cout = g | t;
endmodule""",
        "testbench": """// Exhaustive testbench for 1-bit full adder
`timescale 1ns / 1ps

module full_adder_tb;
    reg a, b, cin;
    wire sum, cout;

    full_adder uut (
        .a(a),
        .b(b),
        .cin(cin),
        .sum(sum),
        .cout(cout)
    );

    integer i;

    initial begin
        $dumpfile(\"full_adder.vcd\");
        $dumpvars(0, full_adder_tb);

        $display(\"Time\\ta\\tb\\tCin\\t|\\tSum\\tCout\");
        $display(\"---------------------------------------\");

        for (i = 0; i < 8; i = i + 1) begin
            {a, b, cin} = i[2:0];
            #10;
            $display(\"%0t\\t%b\\t%b\\t%b\\t|\\t%b\\t%b\", $time, a, b, cin, sum, cout);
        end

        #10 $finish;
    end
endmodule"""
    },
    "alu_simple": {
        "name": "Simple ALU",
        "description": "Behavioral 4-bit ALU with add/sub/logic/shift ops",
        "code": """module alu_simple(
    input [3:0] a, b,
    input [2:0] op,
    output reg [3:0] result,
    output reg zero
);
    always @(*) begin
        case (op)
            3'b000: result = a + b;      // ADD
            3'b001: result = a - b;      // SUB
            3'b010: result = a & b;      // AND
            3'b011: result = a | b;      // OR
            3'b100: result = a ^ b;      // XOR
            3'b101: result = ~a;         // NOT
            3'b110: result = a << 1;     // Shift left
            3'b111: result = a >> 1;     // Shift right
            default: result = 4'b0000;
        endcase
        zero = (result == 4'b0000);
    end
endmodule""",
        "testbench": """// Testbench for simple ALU
module alu_simple_tb;
    reg [3:0] a, b;
    reg [2:0] op;
    wire [3:0] result;
    wire zero;

    alu_simple uut (.a(a), .b(b), .op(op), .result(result), .zero(zero));

    integer i;

    initial begin
        $dumpfile(\"alu_simple.vcd\");
        $dumpvars(0, alu_simple_tb);

        a = 4'b0011; b = 4'b0101;
        for (i = 0; i < 8; i = i + 1) begin
            op = i[2:0];
            #10;
            $display(\"op=%b -> result=%b zero=%b\", op, result, zero);
        end

        #10 $finish;
    end
endmodule"""
    },
}


# ----------------------------------------------------------------------------
# Multiplexers / decoders / encoders / comparators
# ----------------------------------------------------------------------------
COMBINATIONAL = {
    "mux_2to1": {
        "name": "2:1 Multiplexer",
        "description": "Selects between two inputs based on sel",
        "code": """module mux_2to1(
    input a, b, sel,
    output y
);
    assign y = sel ? b : a;
endmodule""",
        "testbench": """// Testbench for 2:1 multiplexer
module mux_2to1_tb;
    reg a, b, sel;
    wire y;

    mux_2to1 uut (.a(a), .b(b), .sel(sel), .y(y));

    initial begin
        $dumpfile(\"mux_2to1.vcd\");
        $dumpvars(0, mux_2to1_tb);

        a = 0; b = 1; sel = 0; #10;
        sel = 1; #10;
        a = 1; b = 0; sel = 0; #10;
        sel = 1; #10;

        #10 $finish;
    end
endmodule"""
    },
    "mux_4to1": {
        "name": "4:1 Multiplexer",
        "description": "Vector-input multiplexer using index select",
        "code": """module mux_4to1(
    input [3:0] data,
    input [1:0] sel,
    output y
);
    assign y = data[sel];
endmodule""",
        "testbench": """// Testbench for 4:1 multiplexer
module mux_4to1_tb;
    reg [3:0] data;
    reg [1:0] sel;
    wire y;

    mux_4to1 uut (.data(data), .sel(sel), .y(y));

    initial begin
        $dumpfile(\"mux_4to1.vcd\");
        $dumpvars(0, mux_4to1_tb);

        data = 4'b1101;
        sel = 2'b00; #10;
        sel = 2'b01; #10;
        sel = 2'b10; #10;
        sel = 2'b11; #10;

        #10 $finish;
    end
endmodule"""
    },
    "decoder_1to4": {
        "name": "1:4 Decoder",
        "description": "One-hot decoder with enable",
        "code": """module decoder_1to4(
    input [1:0] in,
    input enable,
    output reg [3:0] out
);
    always @(*) begin
        if (enable)
            case (in)
                2'b00: out = 4'b0001;
                2'b01: out = 4'b0010;
                2'b10: out = 4'b0100;
                2'b11: out = 4'b1000;
                default: out = 4'b0000;
            endcase
        else
            out = 4'b0000;
    end
endmodule""",
        "testbench": """// Testbench for 1:4 decoder
module decoder_1to4_tb;
    reg [1:0] in;
    reg enable;
    wire [3:0] out;

    decoder_1to4 uut (.in(in), .enable(enable), .out(out));

    integer i;

    initial begin
        $dumpfile(\"decoder_1to4.vcd\");
        $dumpvars(0, decoder_1to4_tb);

        enable = 1'b0;
        for (i = 0; i < 4; i = i + 1) begin
            in = i[1:0]; #10;
        end

        enable = 1'b1;
        for (i = 0; i < 4; i = i + 1) begin
            in = i[1:0]; #10;
        end

        #10 $finish;
    end
endmodule"""
    },
    "priority_encoder": {
        "name": "Priority Encoder",
        "description": "4-to-2 encoder giving highest-order set bit",
        "code": """module priority_encoder(
    input [3:0] in,
    output reg [1:0] out,
    output reg valid
);
    always @(*) begin
        casex (in)
            4'b1xxx: begin out = 2'b11; valid = 1'b1; end
            4'b01xx: begin out = 2'b10; valid = 1'b1; end
            4'b001x: begin out = 2'b01; valid = 1'b1; end
            4'b0001: begin out = 2'b00; valid = 1'b1; end
            default: begin out = 2'b00; valid = 1'b0; end
        endcase
    end
endmodule""",
        "testbench": """// Testbench for priority encoder
module priority_encoder_tb;
    reg [3:0] in;
    wire [1:0] out;
    wire valid;

    priority_encoder uut (.in(in), .out(out), .valid(valid));

    integer i;

    initial begin
        $dumpfile(\"priority_encoder.vcd\");
        $dumpvars(0, priority_encoder_tb);

        for (i = 0; i < 16; i = i + 1) begin
            in = i[3:0];
            #10;
            $display(\"in=%b -> out=%b valid=%b\", in, out, valid);
        end

        #10 $finish;
    end
endmodule"""
    },
    "comparator_2bit": {
        "name": "2-bit Comparator",
        "description": "Reports equal, greater, and less conditions",
        "code": """module comparator_2bit(
    input [1:0] a, b,
    output equal, greater, less
);
    assign equal = (a == b);
    assign greater = (a > b);
    assign less = (a < b);
endmodule""",
        "testbench": """// Testbench for 2-bit comparator
module comparator_2bit_tb;
    reg [1:0] a, b;
    wire equal, greater, less;

    comparator_2bit uut (.a(a), .b(b), .equal(equal), .greater(greater), .less(less));

    integer i;

    initial begin
        $dumpfile(\"comparator_2bit.vcd\");
        $dumpvars(0, comparator_2bit_tb);

        for (i = 0; i < 16; i = i + 1) begin
            {a, b} = i[3:0];
            #10;
            $display(\"a=%b b=%b => equal=%b greater=%b less=%b\", a, b, equal, greater, less);
        end

        #10 $finish;
    end
endmodule"""
    },
}


# ----------------------------------------------------------------------------
# Sequential elements (flip-flops and latches)
# ----------------------------------------------------------------------------
SEQUENTIAL = {
    "d_flip_flop": {
        "name": "D Flip-Flop",
        "description": "Edge-triggered D flip-flop with asynchronous reset",
        "code": """module d_flip_flop(
    input clk, rst, d,
    output reg q
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule""",
        "testbench": """// Testbench for D flip-flop
module d_flip_flop_tb;
    reg clk, rst, d;
    wire q;

    d_flip_flop uut (.clk(clk), .rst(rst), .d(d), .q(q));

    initial begin
        $dumpfile(\"d_flip_flop.vcd\");
        $dumpvars(0, d_flip_flop_tb);

        clk = 0;
        forever #5 clk = ~clk;
    end

    initial begin
        rst = 1; d = 0; #12;
        rst = 0;
        d = 1; #10;
        d = 0; #10;
        rst = 1; #10;
        rst = 0; d = 1; #10;
        #10 $finish;
    end
endmodule"""
    },
    "jk_flip_flop": {
        "name": "JK Flip-Flop",
        "description": "Edge-triggered JK flip-flop with asynchronous reset",
        "code": """module jk_flip_flop(
    input clk, rst, j, k,
    output reg q
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            q <= 1'b0;
        else
            case ({j, k})
                2'b00: q <= q;        // Hold
                2'b01: q <= 1'b0;     // Reset
                2'b10: q <= 1'b1;     // Set
                2'b11: q <= ~q;       // Toggle
            endcase
    end
endmodule""",
        "testbench": """// Testbench for JK flip-flop
module jk_flip_flop_tb;
    reg clk, rst, j, k;
    wire q;

    jk_flip_flop uut (.clk(clk), .rst(rst), .j(j), .k(k), .q(q));

    initial begin
        $dumpfile(\"jk_flip_flop.vcd\");
        $dumpvars(0, jk_flip_flop_tb);

        clk = 0;
        forever #5 clk = ~clk;
    end

    initial begin
        rst = 1; j = 0; k = 0; #12;
        rst = 0;
        {j, k} = 2'b10; #20;
        {j, k} = 2'b01; #20;
        {j, k} = 2'b11; #20;
        {j, k} = 2'b00; #20;
        #20 $finish;
    end
endmodule"""
    },
    "t_flip_flop": {
        "name": "T Flip-Flop",
        "description": "Toggle flip-flop with asynchronous reset",
        "code": """module t_flip_flop(
    input clk, rst, t,
    output reg q
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            q <= 1'b0;
        else if (t)
            q <= ~q;
    end
endmodule""",
        "testbench": """// Testbench for T flip-flop
module t_flip_flop_tb;
    reg clk, rst, t;
    wire q;

    t_flip_flop uut (.clk(clk), .rst(rst), .t(t), .q(q));

    initial begin
        $dumpfile(\"t_flip_flop.vcd\");
        $dumpvars(0, t_flip_flop_tb);

        clk = 0;
        forever #5 clk = ~clk;
    end

    initial begin
        rst = 1; t = 0; #12;
        rst = 0;
        t = 1; #40;
        t = 0; #20;
        t = 1; #40;
        #20 $finish;
    end
endmodule"""
    },
    "sr_latch": {
        "name": "SR Latch",
        "description": "Level-sensitive SR latch with basic truth table",
        "code": """module sr_latch(
    input s, r,
    output reg q, qn
);
    always @(*) begin
        case ({s, r})
            2'b00: begin q = q;   qn = qn; end      // Hold
            2'b01: begin q = 1'b0; qn = 1'b1; end   // Reset
            2'b10: begin q = 1'b1; qn = 1'b0; end   // Set
            2'b11: begin q = 1'bx; qn = 1'bx; end   // Invalid
        endcase
    end
endmodule""",
        "testbench": """// Testbench for SR latch
module sr_latch_tb;
    reg s, r;
    wire q, qn;

    sr_latch uut (.s(s), .r(r), .q(q), .qn(qn));

    initial begin
        $dumpfile(\"sr_latch.vcd\");
        $dumpvars(0, sr_latch_tb);

        s = 0; r = 0; #10;
        s = 1; r = 0; #10;
        s = 0; r = 0; #10;
        s = 0; r = 1; #10;
        s = 0; r = 0; #10;
        s = 1; r = 1; #10; // invalid
        #10 $finish;
    end
endmodule"""
    },
    "d_latch": {
        "name": "D Latch",
        "description": "Level-sensitive D latch with enable",
        "code": """module d_latch(
    input enable, d,
    output reg q
);
    always @(*) begin
        if (enable)
            q = d;
    end
endmodule""",
        "testbench": """// Testbench for D latch
module d_latch_tb;
    reg enable, d;
    wire q;

    d_latch uut (.enable(enable), .d(d), .q(q));

    initial begin
        $dumpfile(\"d_latch.vcd\");
        $dumpvars(0, d_latch_tb);

        enable = 0; d = 0; #10;
        d = 1; #10;
        enable = 1; #10;
        d = 0; #10;
        enable = 0; d = 1; #10;
        enable = 1; #10;
        #10 $finish;
    end
endmodule"""
    },
}


# ----------------------------------------------------------------------------
# Counters and shift register
# ----------------------------------------------------------------------------
COUNTERS = {
    "counter_4bit": {
        "name": "4-bit Counter",
        "description": "Synchronous up counter with enable and reset",
        "code": """module counter_4bit(
    input clk, rst, enable,
    output reg [3:0] count
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            count <= 4'b0000;
        else if (enable)
            count <= count + 1;
    end
endmodule""",
        "testbench": """// Testbench for 4-bit counter
module counter_4bit_tb;
    reg clk, rst, enable;
    wire [3:0] count;

    counter_4bit uut (.clk(clk), .rst(rst), .enable(enable), .count(count));

    initial begin
        $dumpfile(\"counter_4bit.vcd\");
        $dumpvars(0, counter_4bit_tb);

        clk = 0;
        forever #5 clk = ~clk;
    end

    initial begin
        rst = 1; enable = 0; #12;
        rst = 0; enable = 1; #80;
        enable = 0; #20;
        enable = 1; #40;
        #20 $finish;
    end
endmodule"""
    },
    "counter_updown": {
        "name": "Up-Down Counter",
        "description": "4-bit up/down counter controlled by up_down flag",
        "code": """module counter_updown(
    input clk, rst, up_down,
    output reg [3:0] count
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            count <= 4'b0000;
        else if (up_down)
            count <= count + 1;
        else
            count <= count - 1;
    end
endmodule""",
        "testbench": """// Testbench for up/down counter
module counter_updown_tb;
    reg clk, rst, up_down;
    wire [3:0] count;

    counter_updown uut (.clk(clk), .rst(rst), .up_down(up_down), .count(count));

    initial begin
        $dumpfile(\"counter_updown.vcd\");
        $dumpvars(0, counter_updown_tb);

        clk = 0;
        forever #5 clk = ~clk;
    end

    initial begin
        rst = 1; up_down = 1; #12;
        rst = 0; up_down = 1; #60;
        up_down = 0; #60;
        up_down = 1; #40;
        #20 $finish;
    end
endmodule"""
    },
    "shift_register": {
        "name": "Shift Register",
        "description": "4-bit serial-in shift register",
        "code": """module shift_register(
    input clk, rst, serial_in,
    output reg [3:0] parallel_out
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            parallel_out <= 4'b0000;
        else
            parallel_out <= {parallel_out[2:0], serial_in};
    end
endmodule""",
        "testbench": """// Testbench for shift register
module shift_register_tb;
    reg clk, rst, serial_in;
    wire [3:0] parallel_out;

    shift_register uut (.clk(clk), .rst(rst), .serial_in(serial_in), .parallel_out(parallel_out));

    integer i;

    initial begin
        $dumpfile(\"shift_register.vcd\");
        $dumpvars(0, shift_register_tb);

        clk = 0;
        forever #5 clk = ~clk;
    end

    initial begin
        rst = 1; serial_in = 0; #12;
        rst = 0;
        for (i = 0; i < 8; i = i + 1) begin
            serial_in = i[0];
            #10;
        end
        #20 $finish;
    end
endmodule"""
    },
}


# ----------------------------------------------------------------------------
# Finite state machine template
# ----------------------------------------------------------------------------
FSM = {
    "fsm_template": {
        "name": "FSM Template",
        "description": "Three-state Moore FSM skeleton with example transitions",
        "code": """module fsm_template(
    input clk, rst, in,
    output reg out
);
    parameter S0 = 2'b00, S1 = 2'b01, S2 = 2'b10;

    reg [1:0] current_state, next_state;

    // State register
    always @(posedge clk or posedge rst) begin
        if (rst)
            current_state <= S0;
        else
            current_state <= next_state;
    end

    // Next-state logic
    always @(*) begin
        case (current_state)
            S0: next_state = in ? S1 : S0;
            S1: next_state = in ? S2 : S0;
            S2: next_state = in ? S2 : S0;
            default: next_state = S0;
        endcase
    end

    // Output logic
    always @(*) begin
        case (current_state)
            S0: out = 1'b0;
            S1: out = 1'b0;
            S2: out = 1'b1;
            default: out = 1'b0;
        endcase
    end
endmodule""",
        "testbench": """// Testbench for FSM template
module fsm_template_tb;
    reg clk, rst, in;
    wire out;

    fsm_template uut (.clk(clk), .rst(rst), .in(in), .out(out));

    initial begin
        $dumpfile(\"fsm_template.vcd\");
        $dumpvars(0, fsm_template_tb);

        clk = 0;
        forever #5 clk = ~clk;
    end

    initial begin
        rst = 1; in = 0; #12;
        rst = 0;
        in = 1; #20;
        in = 0; #20;
        in = 1; #40;
        in = 0; #20;
        #20 $finish;
    end
endmodule"""
    }
}


# ----------------------------------------------------------------------------
# Public export map
# ----------------------------------------------------------------------------
TEMPLATES = {
    **BASIC_GATES,
    **ARITHMETIC,
    **COMBINATIONAL,
    **SEQUENTIAL,
    **COUNTERS,
    **FSM,
}
