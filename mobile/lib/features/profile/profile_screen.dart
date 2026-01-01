import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_rounded, color: Colors.white),
            onPressed: () => _showEditProfile(context),
          ),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (context, auth, child) {
          final user = auth.user;
          if (user == null) {
            return const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Glass User Card
                Stack(
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 50),
                      child: GlassBox(
                        opacity: 0.05,
                        borderRadius: 24,
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: AppConstants.primaryColor.withOpacity(0.3)),
                            boxShadow: [
                              BoxShadow(color: AppConstants.primaryColor.withOpacity(0.1), blurRadius: 20, spreadRadius: -5),
                            ],
                          ),
                          child: Column(
                            children: [
                              Text(
                                '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}',
                                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                user['email'] ?? '',
                                style: const TextStyle(fontSize: 14, color: Colors.white54),
                              ),
                              const SizedBox(height: 16),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppConstants.primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppConstants.primaryColor.withOpacity(0.5)),
                                ),
                                child: Text(
                                  user['role']?.toString().toUpperCase() ?? 'GUEST',
                                  style: const TextStyle(
                                    color: AppConstants.primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: const Color(0xFF03050C),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppConstants.primaryColor, width: 2),
                            boxShadow: [
                              BoxShadow(color: AppConstants.primaryColor.withOpacity(0.4), blurRadius: 15),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              '${user['firstName']?[0] ?? ''}${user['lastName']?[0] ?? ''}',
                              style: const TextStyle(
                                fontSize: 36,
                                fontWeight: FontWeight.bold,
                                color: AppConstants.primaryColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Wallet Card
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/wallet'),
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppConstants.cyberBlue.withOpacity(0.2), Colors.purpleAccent.withOpacity(0.1)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppConstants.cyberBlue.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Neon Balance', style: TextStyle(color: Colors.white54, fontSize: 13)),
                            const SizedBox(height: 8),
                            Text(
                              '₦${user['walletBalance'] ?? 0}',
                              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white, fontFamily: 'Courier'),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppConstants.cyberBlue.withOpacity(0.1),
                            shape: BoxShape.circle,
                            boxShadow: [BoxShadow(color: AppConstants.cyberBlue.withOpacity(0.2), blurRadius: 10)],
                          ),
                          child: const Icon(Icons.account_balance_wallet_rounded, color: AppConstants.cyberBlue),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Menu Items
                _buildMenuItem(context, Icons.home_rounded, 'My Bookings', 'View your reservations', () => Navigator.pushNamed(context, '/my-bookings')),
                if (user['role'] == 'host')
                  _buildMenuItem(context, Icons.apartment_rounded, 'Host Dashboard', 'Manage your properties', () => Navigator.pushNamed(context, '/host-dashboard')),
                _buildMenuItem(context, Icons.chat_bubble_rounded, 'Messages', 'Chat with hosts and guests', () => Navigator.pushNamed(context, '/chat-list')),
                _buildMenuItem(context, Icons.help_rounded, 'Help & Support', 'Get help or contact us', () {}),
                _buildMenuItem(context, Icons.settings_rounded, 'Settings', 'App preferences', () {}),

                const SizedBox(height: 32),

                // Logout Button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _logout(context),
                    icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
                    label: const Text('LOGOUT', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: BorderSide(color: Colors.redAccent.withOpacity(0.5)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      backgroundColor: Colors.redAccent.withOpacity(0.05),
                    ),
                  ),
                ),
                
                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, String subtitle, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.white.withOpacity(0.05))),
        tileColor: Colors.white.withOpacity(0.03),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: Colors.white70),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.white38)),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.white24),
      ),
    );
  }

  void _showEditProfile(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0A0E21),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        height: 300,
        child: Column(
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 32),
            const Icon(Icons.construction_rounded, size: 48, color: AppConstants.primaryColor),
            const SizedBox(height: 16),
            const Text(
              'Profile Editing',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
             const SizedBox(height: 8),
            const Text(
              'This feature is coming in the next update.',
              style: TextStyle(color: Colors.white54),
            ),
          ],
        ),
      ),
    );
  }

  void _logout(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1D2D),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: Colors.white.withOpacity(0.1))),
        title: const Text('Logout', style: TextStyle(color: Colors.white)),
        content: const Text('Are you sure you want to disconnect?', style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<AuthProvider>().logout();
              Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
