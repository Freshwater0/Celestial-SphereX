import matplotlib.pyplot as plt
import numpy as np

# Performance data from load test
concurrent_users = [100, 500, 1000, 1500, 2000, 2500, 3000]
total_processing_time = [52.62, 295.60, 613.19, 927.64, 1198.13, 1510.72, 1762.67]
avg_processing_time = [50.81, 58.27, 60.89, 61.29, 59.49, 59.89, 58.21]

plt.figure(figsize=(12, 6))

# Total Processing Time
plt.subplot(1, 2, 1)
plt.plot(concurrent_users, total_processing_time, marker='o', color='blue', linewidth=2)
plt.title('Total Processing Time vs Concurrent Users')
plt.xlabel('Concurrent Users')
plt.ylabel('Total Processing Time (ms)')
plt.grid(True)

# Average Processing Time
plt.subplot(1, 2, 2)
plt.plot(concurrent_users, avg_processing_time, marker='o', color='green', linewidth=2)
plt.title('Average Processing Time vs Concurrent Users')
plt.xlabel('Concurrent Users')
plt.ylabel('Average Processing Time (ms)')
plt.grid(True)

plt.tight_layout()
plt.savefig('c:/Users/tshoj/celestial-sphere/backend/performance-metrics-visualization.png')
plt.close()

# Generate additional performance insights
def analyze_performance():
    scaling_efficiency = np.polyfit(concurrent_users, total_processing_time, 1)
    linear_scaling_rate = scaling_efficiency[0]
    
    print(f"Linear Scaling Rate: {linear_scaling_rate:.4f} ms per concurrent user")
    
    performance_stability = np.std(avg_processing_time)
    print(f"Performance Stability (Standard Deviation): {performance_stability:.2f} ms")

analyze_performance()
