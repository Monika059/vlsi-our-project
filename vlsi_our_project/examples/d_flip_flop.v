// D Flip-Flop with Asynchronous Reset
// Edge-triggered storage element

module d_flip_flop(
    input clk,      // Clock signal
    input rst,      // Asynchronous reset (active high)
    input d,        // Data input
    output reg q    // Data output
);
    // Always block triggered on positive edge of clock or reset
    always @(posedge clk or posedge rst) begin
        if (rst)
            q <= 1'b0;  // Reset output to 0
        else
            q <= d;     // Capture input on clock edge
    end
endmodule

// Testbench for D Flip-Flop
module d_flip_flop_tb;
    reg clk, rst, d;
    wire q;
    
    // Instantiate the D flip-flop
    d_flip_flop uut (
        .clk(clk),
        .rst(rst),
        .d(d),
        .q(q)
    );
    
    // Clock generation (10 time units period)
    initial begin
        clk = 0;
        forever #5 clk = ~clk;
    end
    
    // Test sequence
    initial begin
        $display("D Flip-Flop Test");
        $display("Time | Clk Rst D | Q");
        $display("-----|-----------|---");
        
        // Initialize
        rst = 1; d = 0;
        #10;
        $display("%4t |  %b   %b  %b | %b", $time, clk, rst, d, q);
        
        // Release reset
        rst = 0;
        #10;
        $display("%4t |  %b   %b  %b | %b", $time, clk, rst, d, q);
        
        // Test D=1
        d = 1;
        #10;
        $display("%4t |  %b   %b  %b | %b", $time, clk, rst, d, q);
        
        // Test D=0
        d = 0;
        #10;
        $display("%4t |  %b   %b  %b | %b", $time, clk, rst, d, q);
        
        // Test D=1 again
        d = 1;
        #10;
        $display("%4t |  %b   %b  %b | %b", $time, clk, rst, d, q);
        
        // Test reset during operation
        rst = 1;
        #10;
        $display("%4t |  %b   %b  %b | %b", $time, clk, rst, d, q);
        
        $finish;
    end
endmodule
