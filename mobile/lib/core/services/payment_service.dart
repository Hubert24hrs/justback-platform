import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class PaymentService {
  // Mock service to avoid Web Build issues with Paystack Plugin
  
  Future<void> initialize() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<bool> chargeCard({
    required BuildContext context,
    required String email,
    required double amount,
    required String reference,
  }) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    // Simulate success visualization
    if (context.mounted) {
       ScaffoldMessenger.of(context).showSnackBar(
         const SnackBar(
           content: Text('💳 Processing Payment via Paystack Secure Gateway...'),
           backgroundColor: AppConstants.primaryColor,
           duration: Duration(seconds: 2),
         )
       );
    }
    
    await Future.delayed(const Duration(seconds: 2));
    return true; // Always succeed for Demo
  }
}
