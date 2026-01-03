import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';
import 'dart:ui';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final List<Map<String, dynamic>> _mockTransactions = [
    {'type': 'credit', 'amount': 50000, 'description': 'Refund: #8821', 'date': 'Today, 10:23 AM'},
    {'type': 'debit', 'amount': 135000, 'description': 'Booking: "Lekki Luxury"', 'date': 'Yesterday, 4:15 PM'},
    {'type': 'credit', 'amount': 200000, 'description': 'Top Up: Bank Transfer', 'date': '25 Dec, 09:00 AM'},
    {'type': 'debit', 'amount': 85000, 'description': 'Booking: "VI Studio"', 'date': '20 Dec, 02:30 PM'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: const Color(0xFF03050C),
        appBar: AppBar(
          title: const Text('Neon Wallet', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.qr_code_scanner_rounded, color: AppConstants.primaryColor),
              onPressed: () {},
            ),
          ],
        ),
        body: Consumer<AuthProvider>(builder: (context, auth, child) {
          final balance = auth.user?['walletBalance'] ?? 0;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Holographic Balance Card
                Stack(
                  children: [
                    Container(
                      height: 220,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(30),
                        gradient: const LinearGradient(
                          colors: [Color(0xFF00F260), Color(0xFF0575E6)], // Neon Green to Blue
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFF00F260).withValues(alpha: 0.4), blurRadius: 25, offset: const Offset(0, 10)),
                        ],
                      ),
                    ),
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(30),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(30),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('TOTAL BALANCE', style: TextStyle(color: Colors.white70, letterSpacing: 2, fontSize: 12, fontWeight: FontWeight.bold)),
                              Icon(Icons.nfc_rounded, color: Colors.white.withValues(alpha: 0.8), size: 30),
                            ],
                          ),
                          const Spacer(),
                          Text(
                            '₦${_formatMoney(balance)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 40,
                              fontWeight: FontWeight.w900,
                              height: 1,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            '**** **** **** 8291',
                            style: TextStyle(color: Colors.white60, fontSize: 16, letterSpacing: 2),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Action Buttons
                Row(
                  children: [
                    _buildActionButton('Fund', Icons.add_rounded, AppConstants.primaryColor, () => _showFundWallet(context)),
                    const SizedBox(width: 16),
                    _buildActionButton('Withdraw', Icons.arrow_outward_rounded, const Color(0xFF00BFFF), () => _showWithdraw(context)),
                    const SizedBox(width: 16),
                     _buildActionButton('Swap', Icons.swap_horiz_rounded, Colors.purpleAccent, () {}),
                  ],
                ),

                const SizedBox(height: 40),

                // Transactions
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                     const Text(
                      'Recent Activity',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text('View All', style: TextStyle(color: Colors.white54)),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _mockTransactions.length,
                  itemBuilder: (context, index) {
                    final tx = _mockTransactions[index];
                    return _buildTransactionItem(tx);
                  },
                ),
              ],
            ),
          );
        }));
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionItem(Map<String, dynamic> tx) {
    final isCredit = tx['type'] == 'credit';
    final color = isCredit ? AppConstants.neonGreen : Colors.redAccent;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: GlassBox(
        opacity: 0.05,
        borderRadius: 20,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                  color: color,
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                     Text(
                      tx['description'],
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tx['date'],
                      style: const TextStyle(color: Colors.white38, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Text(
                '${isCredit ? '+' : '-'}₦${_formatMoney(tx['amount'])}',
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  fontFamily: 'Courier',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatMoney(dynamic amount) {
    return amount.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  void _showFundWallet(BuildContext context) {
    _showCyberModal(
      context, 
      'Fund Wallet', 
      Icons.add_card_rounded, 
      'Enter amount to top up',
      'Proceed to Payment'
    );
  }

  void _showWithdraw(BuildContext context) {
     _showCyberModal(
      context, 
      'Withdraw Funds', 
      Icons.account_balance_rounded, 
      'Enter amount to withdraw',
      'Request Withdrawal'
    );
  }
  
  void _showCyberModal(BuildContext context, String title, IconData icon, String label, String btnText) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent, // Important for glass effect
      isScrollControlled: true,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          left: 24, 
          right: 24, 
          top: 32, 
          bottom: MediaQuery.of(context).viewInsets.bottom + 32
        ),
        decoration: const BoxDecoration(
          color: Color(0xFF0F111A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          border: Border(top: BorderSide(color: AppConstants.primaryColor, width: 2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Row(
               children: [
                 Icon(icon, color: AppConstants.primaryColor, size: 28),
                 const SizedBox(width: 16),
                 Text(title, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
               ],
             ),
             const SizedBox(height: 32),
             TextField(
               keyboardType: TextInputType.number,
               style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
               decoration: InputDecoration(
                 prefixText: '₦ ',
                 prefixStyle: const TextStyle(color: AppConstants.primaryColor, fontSize: 24),
                 labelText: label,
                 labelStyle: const TextStyle(color: Colors.white54),
                 enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2))),
                 focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: AppConstants.primaryColor)),
               ),
             ),
             const SizedBox(height: 40),
             SizedBox(
               width: double.infinity,
               height: 56,
               child: ElevatedButton(
                 onPressed: () {
                   Navigator.pop(context);
                   ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                     content: Text('$title Successful!'),
                     backgroundColor: AppConstants.primaryColor,
                   ));
                 },
                 style: ElevatedButton.styleFrom(
                   backgroundColor: AppConstants.primaryColor,
                   foregroundColor: Colors.black,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                 ),
                 child: Text(btnText, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
               ),
             ),
          ],
        ),
      ),
    );
  }
}

