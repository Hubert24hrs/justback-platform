import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/app_constants.dart';
import 'api_client.dart';

class PaymentService {
  // Mock service to avoid Web Build issues with Paystack Plugin
  
  final ApiClient _apiClient = ApiClient();
  
  Future<void> initialize() async {
    // No initialization needed for API mode
  }

  Future<bool> chargeCard({
    required BuildContext context,
    required String email,
    required double amount,
    required String reference,
    required String bookingId,
  }) async {
    try {
      // 1. Initialize Payment on Backend
      final response = await _apiClient.post('/payments/initialize', {
        'email': email,
        'amount': amount,
        'bookingId': bookingId,
        'reference': reference,
      });

      if (response.data['status'] == true || response.data['success'] == true) {
        final data = response.data['data'];
        final String authUrl = data['authorization_url'];
        final String accessCode = data['access_code'];

        // 2. Open Paystack Checkout in Browser/WebView
        final Uri url = Uri.parse(authUrl);
        if (await canLaunchUrl(url)) {
          await launchUrl(url, mode: LaunchMode.externalApplication);
          
          // 3. Show Verification Dialog
          if (context.mounted) {
             return await _showVerificationDialog(context, reference);
          }
        } else {
           throw Exception('Could not launch payment URL');
        }
      }
      return false;
    } catch (e) {
      debugPrint('Payment Error: $e');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment Initialization Failed: $e')),
        );
      }
      return false;
    }
  }

  Future<bool> _showVerificationDialog(BuildContext context, String reference) async {
    return await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Complete Payment'),
        content: const Text('Please complete the payment in your browser. Once done, click "I have paid".'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false), // Cancelled
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              // Verify Payment
              try {
                final response = await _apiClient.post('/payments/verify', {
                  'reference': reference,
                });
                
                if (response.data['success'] == true) {
                  Navigator.pop(context, true); // Verified
                } else {
                   ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Payment not verified completely yet. Please try again.')),
                   );
                }
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Verification Failed: $e')),
                );
              }
            },
            child: const Text('I have paid'),
          ),
        ],
      ),
    ) ?? false;
  }
}
