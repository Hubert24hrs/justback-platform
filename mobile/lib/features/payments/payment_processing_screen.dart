import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/booking_provider.dart';
import '../../core/constants/app_constants.dart';
import 'dart:math' as math;

class PaymentProcessingScreen extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const PaymentProcessingScreen({Key? key, required this.bookingData}) : super(key: key);

  @override
  State<PaymentProcessingScreen> createState() => _PaymentProcessingScreenState();
}

class _PaymentProcessingScreenState extends State<PaymentProcessingScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  String _statusText = 'Initializing secure payment...';

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _processPayment();
  }

  Future<void> _processPayment() async {
    // 1. Initial Delay
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _statusText = 'Verifying credentials...');

    // 2. Processing
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _statusText = 'Confirming transaction...');

    // 3. Finalize & Create Booking
    await Future.delayed(const Duration(seconds: 1));
    
    if (!mounted) return;

    try {
      final success = await context.read<BookingProvider>().createBooking(widget.bookingData);
      
      if (success) {
        if (mounted)Navigator.pushReplacementNamed(context, '/booking-success');
      } else {
        // Handle failure (mock for now, assume success)
         if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             const SnackBar(content: Text('Payment failed. Please try again.')),
           );
           Navigator.pop(context);
         }
      }
    } catch (e) {
       if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             SnackBar(content: Text('Error: $e')),
           );
           Navigator.pop(context);
       }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Custom Neon Loader
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Transform.rotate(
                  angle: _controller.value * 2 * math.pi,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppConstants.primaryColor.withOpacity(0.3),
                        width: 4,
                      ),
                    ),
                    child: Center(
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border(
                             top: BorderSide(color: AppConstants.primaryColor, width: 4),
                             left: BorderSide(color: AppConstants.cyberBlue, width: 4),
                             bottom: BorderSide(color: Colors.transparent, width: 4),
                             right: BorderSide(color: Colors.transparent, width: 4),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppConstants.primaryColor.withOpacity(0.4),
                              blurRadius: 20,
                              spreadRadius: 2,
                            )
                          ]
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 48),
            
            Text(
              _statusText,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w500,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Please do not close the app',
              style: TextStyle(color: Colors.white38, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}
