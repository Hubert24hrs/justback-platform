import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/host_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';

class HostEarningsScreen extends StatefulWidget {
  const HostEarningsScreen({super.key});

  @override
  State<HostEarningsScreen> createState() => _HostEarningsScreenState();
}

class _HostEarningsScreenState extends State<HostEarningsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) context.read<HostProvider>().fetchHostDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        title: const Text('Earnings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.download_rounded, color: AppConstants.primaryColor, size: 18),
            label: const Text('Export', style: TextStyle(color: AppConstants.primaryColor)),
          ),
        ],
      ),
      body: Consumer<HostProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Balance Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    gradient: LinearGradient(
                      colors: [
                        AppConstants.primaryColor.withValues(alpha: 0.9),
                        AppConstants.cyberBlue.withValues(alpha: 0.7),
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppConstants.primaryColor.withValues(alpha: 0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Available Balance', style: TextStyle(color: Colors.black54, fontSize: 14)),
                      const SizedBox(height: 8),
                      const Text(
                        '₦2,450,000',
                        style: TextStyle(color: Colors.black, fontSize: 36, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => _showWithdrawDialog(),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.black,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Withdraw', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.black,
                                side: const BorderSide(color: Colors.black54),
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('History', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Stats Row
                Row(
                  children: [
                    _buildStatCard('This Month', '₦340,000', Icons.calendar_month_rounded, Colors.purpleAccent),
                    const SizedBox(width: 12),
                    _buildStatCard('Pending', '₦85,000', Icons.hourglass_top_rounded, Colors.orangeAccent),
                  ],
                ),

                const SizedBox(height: 32),

                // Recent Transactions Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Recent Transactions',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text('See All', style: TextStyle(color: AppConstants.primaryColor)),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Transactions List
                _buildTransactionItem('Booking Payment', 'Skyline Penthouse • 3 nights', '+₦255,000', true),
                _buildTransactionItem('Withdrawal', 'To GT Bank ****4521', '-₦150,000', false),
                _buildTransactionItem('Booking Payment', 'Quantum Smart-Stay • 2 nights', '+₦70,000', true),
                _buildTransactionItem('Service Fee', 'Platform commission', '-₦25,500', false),
                _buildTransactionItem('Booking Payment', 'Neon Horizon Duplex • 4 nights', '+₦380,000', true),

                const SizedBox(height: 80),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: GlassBox(
        opacity: 0.05,
        borderRadius: 16,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 12),
              Text(title, style: const TextStyle(color: Colors.white54, fontSize: 12)),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionItem(String title, String subtitle, String amount, bool isCredit) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (isCredit ? AppConstants.primaryColor : Colors.redAccent).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
              color: isCredit ? AppConstants.primaryColor : Colors.redAccent,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          Text(
            amount,
            style: TextStyle(
              color: isCredit ? AppConstants.primaryColor : Colors.redAccent,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }

  void _showWithdrawDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F111A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Withdraw Funds', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            TextField(
              style: const TextStyle(color: Colors.white, fontSize: 24),
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Amount',
                labelStyle: const TextStyle(color: Colors.white54),
                prefixText: '₦ ',
                prefixStyle: const TextStyle(color: Colors.white, fontSize: 24),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Icon(Icons.account_balance_rounded, color: AppConstants.primaryColor),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('GT Bank', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                      Text('****4521', style: TextStyle(color: Colors.white54, fontSize: 12)),
                    ],
                  ),
                  Spacer(),
                  Icon(Icons.check_circle_rounded, color: AppConstants.primaryColor),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Confirm Withdrawal', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
