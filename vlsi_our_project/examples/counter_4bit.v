// 4-bit Synchronous Up Counter
// Counts from 0 to 15 and wraps around

module counter_4bit(
    input clk,              // Clock signal
    input rst,              // Synchronous reset
    input enable,           // Enable counting
    output reg [3:0] count  // 4-bit count output
);
    always @(posedge clk) begin
        if (rst)
            count <= 4'b0000;       // Reset to 0
        else if (enable)
            count <= count + 1;     // Increment counter
        // If enable is 0, count holds its value
    end
endmodule

// Testbench for 4-bit Counter
module counter_4bit_tb;
    reg clk, rst, enable;
    wire [3:0] count;
    
    // Instantiate the counter
    counter_4bit uut (
        .clk(clk),
        .rst(rst),
        .enable(enable),
        .count(count)
    );
    
    // Clock generation
    initial begin
        clk = 0;
        forever #5 clk = ~clk;
    end
    
    // Test sequence
    initial begin
        $display("4-bit Counter Test");
        $display("Time | Rst En | Count");
        $display("-----|--------|------");
        
        // Initialize with reset
        rst = 1; enable = 0;
        #10;
        $display("%4t |  %b   %b | %4b (%2d)", $time, rst, enable, count, count);
        
        // Start counting
        rst = 0; enable = 1;
        #10;
        $display("%4t |  %b   %b | %4b (%2d)", $time, rst, enable, count, count);
        
        // Count for several cycles
        repeat(15) begin
            #10;
            $display("%4t |  %b   %b | %4b (%2d)", $time, rst, enable, count, count);
        end
        
        // Test enable = 0 (hold)
        enable = 0;
        #20;
        $display("%4t |  %b   %b | %4b (%2d) - HOLD", $time, rst, enable, count, count);
        
        // Resume counting
        enable = 1;
        #30;
        $display("%4t |  %b   %b | %4b (%2d)", $time, rst, enable, count, count);
        
        // Test reset during operation
        rst = 1;
        #10;
        $display("%4t |  %b   %b | %4b (%2d) - RESET", $time, rst, enable, count, count);
        
        $finish;
    end
endmodule
