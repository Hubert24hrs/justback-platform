import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/booking_provider.dart';
import '../../core/constants/app_constants.dart';
import 'package:intl/intl.dart';

class BookingSummaryScreen extends StatefulWidget {
  final Map<String, dynamic> property;

  const BookingSummaryScreen({
    Key? key,
    required this.property,
  }) : super(key: key);

  @override
  State<BookingSummaryScreen> createState() => _BookingSummaryScreenState();
}

class _BookingSummaryScreenState extends State<BookingSummaryScreen> {
  DateTimeRange? _selectedDates;
  int _guests = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirm Booking'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.home, color: Colors.grey),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.property['title'],
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.property['city']}, ${widget.property['state']}',
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Your Stay',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            // Date Selection
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Dates', style: TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text(
                _selectedDates == null
                    ? 'Select your dates'
                    : '${DateFormat('MMM d').format(_selectedDates!.start)} - ${DateFormat('MMM d').format(_selectedDates!.end)}',
              ),
              trailing: TextButton(
                onPressed: _showDatePicker,
                child: const Text('Edit'),
              ),
            ),
            const Divider(),
            // Guest Selection
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Guests', style: TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text('$_guests ${ _guests > 1 ? 'guests' : 'guest'}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline),
                    onPressed: _guests > 1 ? () => setState(() => _guests--) : null,
                  ),
                  Text('$_guests', style: const TextStyle(fontSize: 16)),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: _guests < widget.property['maxGuests']
                        ? () => setState(() => _guests++)
                        : null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Price Details',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildPriceRow('₦${widget.property['basePrice']} x ${_getNights()} nights', '₦${_getSubtotal()}'),
            _buildPriceRow('Service fee', '₦${_getServiceFee()}'),
            const Divider(),
            _buildPriceRow('Total', '₦${_getTotal()}', isTotal: true),
            const SizedBox(height: 48),
            // Confirm Button
            Consumer<BookingProvider>(
              builder: (context, bookingProvider, child) {
                return SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    onPressed: _selectedDates == null || bookingProvider.isLoading
                        ? null
                        : _handleCreateBooking,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: bookingProvider.isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Confirm and Pay',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showDatePicker() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppConstants.primaryColor,
              onPrimary: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _selectedDates = picked);
    }
  }

  int _getNights() {
    if (_selectedDates == null) return 0;
    return _selectedDates!.duration.inDays;
  }

  double _getSubtotal() {
    return (widget.property['basePrice'] as num).toDouble() * _getNights();
  }

  double _getServiceFee() {
    return _getSubtotal() * 0.1; // 10% service fee
  }

  double _getTotal() {
    return _getSubtotal() + _getServiceFee();
  }

  Widget _buildPriceRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? AppConstants.primaryColor : null,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleCreateBooking() async {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    final success = await bookingProvider.createBooking({
      'propertyId': widget.property['id'],
      'startDate': _selectedDates!.start.toIso8601String(),
      'endDate': _selectedDates!.end.toIso8601String(),
      'guests': _guests,
      'totalPrice': _getTotal(),
    });

    if (success && mounted) {
      Navigator.pushNamedAndRemoveUntil(
        context,
        '/booking-success',
        (route) => route.settings.name == '/home',
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(bookingProvider.error ?? 'Booking failed')),
      );
    }
  }
}
