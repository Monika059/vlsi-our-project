// Half Adder - Basic Combinational Circuit
// Adds two 1-bit inputs and produces sum and carry output

module half_adder(
    input a,        // First input bit
    input b,        // Second input bit
    output sum,     // Sum output
    output carry    // Carry output
);
    // Sum is XOR of inputs (a XOR b)
    assign sum = a ^ b;
    
    // Carry is AND of inputs (a AND b)
    assign carry = a & b;
    
endmodule

// Testbench for Half Adder
module half_adder_tb;
    reg a, b;
    wire sum, carry;
    
    // Instantiate the half adder
    half_adder uut (
        .a(a),
        .b(b),
        .sum(sum),
        .carry(carry)
    );
    
    initial begin
        $display("Half Adder Test");
        $display("A B | Sum Carry");
        $display("----|----------");
        
        // Test all 4 combinations
        a = 0; b = 0; #10;
        $display("%b %b |  %b   %b", a, b, sum, carry);
        
        a = 0; b = 1; #10;
        $display("%b %b |  %b   %b", a, b, sum, carry);
        
        a = 1; b = 0; #10;
        $display("%b %b |  %b   %b", a, b, sum, carry);
        
        a = 1; b = 1; #10;
        $display("%b %b |  %b   %b", a, b, sum, carry);
        
        $finish;
    end
    
    // Generate VCD file for waveform viewing
    initial begin
        $dumpfile("half_adder.vcd");
        $dumpvars(0, half_adder_tb);
    end
endmodule
