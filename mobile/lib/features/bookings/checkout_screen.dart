import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/services/payment_service.dart';
import '../../core/providers/booking_provider.dart';
import '../../core/providers/auth_provider.dart';

class CheckoutScreen extends StatefulWidget {
  final Map<String, dynamic> bookingDetails;

  const CheckoutScreen({super.key, required this.bookingDetails});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final PaymentService _paymentService = PaymentService();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _paymentService.initialize();
  }

  Future<void> _handlePayment() async {
    setState(() => _isLoading = true);

    final user = context.read<AuthProvider>().user;
    final amount = widget.bookingDetails['totalPrice'] ?? 50000.0;
    
    // Generate a reference
    final reference = 'JB-${DateTime.now().millisecondsSinceEpoch}';

    // 1. Create Pending Booking First
    final bookingProvider = context.read<BookingProvider>();
    try {
      final bookingSuccess = await bookingProvider.createBooking(
        {
          'propertyId': widget.bookingDetails['propertyId'],
          'checkInDate': widget.bookingDetails['startDate'],
          'checkOutDate': widget.bookingDetails['endDate'],
          'numGuests': widget.bookingDetails['guests'],
          'paymentReference': reference,
          'paymentMethod': 'PAYSTACK',
          'status': 'pending', // Initial status
          'paymentStatus': 'pending' 
        }
      );

      if (!bookingSuccess) {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to initiate booking: ${bookingProvider.error}')));
           setState(() => _isLoading = false);
        }
        return;
      }

      final bookingId = bookingProvider.lastCreatedBooking?['id'] ?? 'unknown-booking';

      // 2. Process Payment
      final paymentSuccess = await _paymentService.chargeCard(
        context: context,
        email: user?['email'] ?? 'guest@justback.com',
        amount: amount.toDouble(),
        reference: reference,
        bookingId: bookingId,
      );

      if (paymentSuccess) {
        if (mounted) {
           Navigator.pushNamedAndRemoveUntil(context, '/booking-success', (route) => false);
        }
      } else {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment verification failed or cancelled')));
        }
      }

    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }

    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final amount = widget.bookingDetails['totalPrice'] ?? 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Text('Total Amount to Pay', style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: 8),
                  Text(
                    '₦${amount.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppConstants.primaryColor),
                  ),
                ],
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handlePayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isLoading 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Pay with Paystack', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
