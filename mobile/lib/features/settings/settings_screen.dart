import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/providers/auth_provider.dart';

/// Full Settings Screen with all options
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = false;
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _smsNotifications = false;
  bool _biometricAuth = false;
  String _selectedLanguage = 'English';
  String _selectedCurrency = 'NGN (₦)';

  final List<String> _languages = [
    'English',
    'Hausa',
    'Yoruba',
    'Igbo',
    'Pidgin',
  ];

  final List<String> _currencies = [
    'NGN (₦)',
    'USD (\$)',
    'GBP (£)',
    'EUR (€)',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Settings',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 16),

          // Appearance Section
          _buildSectionHeader('Appearance'),
          _buildSettingsCard([
            _buildSwitchTile(
              icon: Icons.dark_mode,
              iconColor: Colors.indigo,
              title: 'Dark Mode',
              subtitle: 'Switch to dark theme',
              value: _darkMode,
              onChanged: (value) {
                setState(() => _darkMode = value);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Dark mode ${value ? 'enabled' : 'disabled'}')),
                );
              },
            ),
            _buildDivider(),
            _buildDropdownTile(
              icon: Icons.language,
              iconColor: Colors.blue,
              title: 'Language',
              value: _selectedLanguage,
              options: _languages,
              onChanged: (value) {
                setState(() => _selectedLanguage = value!);
              },
            ),
            _buildDivider(),
            _buildDropdownTile(
              icon: Icons.attach_money,
              iconColor: Colors.green,
              title: 'Currency',
              value: _selectedCurrency,
              options: _currencies,
              onChanged: (value) {
                setState(() => _selectedCurrency = value!);
              },
            ),
          ]),

          // Notifications Section
          _buildSectionHeader('Notifications'),
          _buildSettingsCard([
            _buildSwitchTile(
              icon: Icons.notifications_active,
              iconColor: Colors.orange,
              title: 'Push Notifications',
              subtitle: 'Receive booking updates and alerts',
              value: _pushNotifications,
              onChanged: (value) {
                setState(() => _pushNotifications = value);
              },
            ),
            _buildDivider(),
            _buildSwitchTile(
              icon: Icons.email,
              iconColor: Colors.red,
              title: 'Email Notifications',
              subtitle: 'Receive updates via email',
              value: _emailNotifications,
              onChanged: (value) {
                setState(() => _emailNotifications = value);
              },
            ),
            _buildDivider(),
            _buildSwitchTile(
              icon: Icons.sms,
              iconColor: Colors.teal,
              title: 'SMS Notifications',
              subtitle: 'Receive updates via SMS',
              value: _smsNotifications,
              onChanged: (value) {
                setState(() => _smsNotifications = value);
              },
            ),
          ]),

          // Privacy & Security Section
          _buildSectionHeader('Privacy & Security'),
          _buildSettingsCard([
            _buildSwitchTile(
              icon: Icons.fingerprint,
              iconColor: Colors.purple,
              title: 'Biometric Authentication',
              subtitle: 'Use fingerprint or face to login',
              value: _biometricAuth,
              onChanged: (value) {
                setState(() => _biometricAuth = value);
              },
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.lock,
              iconColor: Colors.amber,
              title: 'Change Password',
              onTap: () {
                _showChangePasswordDialog();
              },
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.privacy_tip,
              iconColor: Colors.cyan,
              title: 'Privacy Policy',
              onTap: () {
                // Navigate to privacy policy
              },
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.description,
              iconColor: Colors.brown,
              title: 'Terms of Service',
              onTap: () {
                // Navigate to terms
              },
            ),
          ]),

          // Support Section
          _buildSectionHeader('Support'),
          _buildSettingsCard([
            _buildNavigationTile(
              icon: Icons.help_outline,
              iconColor: Colors.blue,
              title: 'Help Center',
              onTap: () {
                // Navigate to help center
              },
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.chat_bubble_outline,
              iconColor: Colors.green,
              title: 'Contact Support',
              subtitle: 'support@justback.ng',
              onTap: () {
                // Open support chat
              },
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.bug_report,
              iconColor: Colors.red,
              title: 'Report a Bug',
              onTap: () {
                // Report bug
              },
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.star_outline,
              iconColor: Colors.amber,
              title: 'Rate the App',
              onTap: () {
                // Open app store
              },
            ),
          ]),

          // Account Section
          _buildSectionHeader('Account'),
          _buildSettingsCard([
            _buildNavigationTile(
              icon: Icons.download,
              iconColor: Colors.indigo,
              title: 'Download My Data',
              onTap: () {
                _showDownloadDataDialog();
              },
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.delete_forever,
              iconColor: Colors.red,
              title: 'Delete Account',
              titleColor: Colors.red,
              onTap: () {
                _showDeleteAccountDialog();
              },
            ),
          ]),

          // App Info Section
          _buildSectionHeader('About'),
          _buildSettingsCard([
            _buildInfoTile(
              icon: Icons.info_outline,
              iconColor: Colors.grey,
              title: 'App Version',
              value: '1.0.0 (Build 1)',
            ),
            _buildDivider(),
            _buildNavigationTile(
              icon: Icons.update,
              iconColor: Colors.green,
              title: 'Check for Updates',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('You have the latest version!')),
                );
              },
            ),
          ]),

          // Logout Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: () {
                _showLogoutDialog();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[50],
                foregroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.logout),
                  SizedBox(width: 8),
                  Text(
                    'Log Out',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Colors.grey[600],
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildDivider() {
    return Divider(height: 1, indent: 56, color: Colors.grey[200]);
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    String? subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                ),
                if (subtitle != null)
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppConstants.primaryColor,
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
    required List<String> options,
    required ValueChanged<String?> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
            ),
          ),
          DropdownButton<String>(
            value: value,
            underline: const SizedBox(),
            items: options.map((opt) => DropdownMenuItem(
              value: opt,
              child: Text(opt, style: const TextStyle(fontSize: 14)),
            )).toList(),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    String? subtitle,
    Color? titleColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: titleColor ?? Colors.black87,
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
            ),
          ),
          Text(
            value,
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Current Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'New Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Confirm New Password',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Password updated successfully!')),
              );
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _showDownloadDataDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Download My Data'),
        content: const Text(
          'We will prepare a copy of your data and send it to your email address. This may take up to 24 hours.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Data export requested. Check your email.')),
              );
            },
            child: const Text('Request Download'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account?'),
        content: const Text(
          'This action cannot be undone. All your data, bookings, and payment history will be permanently deleted.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Delete account logic
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Log Out'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthProvider>().logout();
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Log Out'),
          ),
        ],
      ),
    );
  }
}
