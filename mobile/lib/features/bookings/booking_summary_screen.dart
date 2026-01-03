import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/providers/booking_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';
import 'booking_date_picker_screen.dart';
import 'booking_guest_screen.dart';

class BookingSummaryScreen extends StatefulWidget {
  final Map<String, dynamic> property;

  const BookingSummaryScreen({
    super.key,
    required this.property,
  });

  @override
  State<BookingSummaryScreen> createState() => _BookingSummaryScreenState();
}

class _BookingSummaryScreenState extends State<BookingSummaryScreen> {
  DateTimeRange? _selectedDates;
  int _guests = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        title: const Text('Confirm Booking', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
          style: IconButton.styleFrom(
            backgroundColor: Colors.white.withValues(alpha: 0.05),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property Summary Card (Glass)
            GlassBox(
              borderRadius: 20,
              opacity: 0.1,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        image: widget.property['imageUrl'] != null
                            ? DecorationImage(
                                image: NetworkImage(widget.property['imageUrl']),
                                fit: BoxFit.cover,
                              )
                            : null,
                        color: Colors.grey[900],
                      ),
                      child: widget.property['imageUrl'] == null
                          ? const Icon(Icons.home_work_rounded, color: Colors.white24, size: 30)
                          : null,
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
                              color: Colors.white,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.location_on_rounded, color: Colors.white54, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.property['city']}, ${widget.property['state']}',
                                style: const TextStyle(color: Colors.white54, fontSize: 13),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                              const SizedBox(width: 4),
                              Text(
                                '${widget.property['rating'] ?? 4.9} (120 reviews)',
                                style: const TextStyle(color: Colors.white70, fontSize: 13),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 32),
            const Text(
              'Your Trip',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 16),
            
            // Trip Details (Interactive)
            _buildTripDetailItem(
              'Dates',
              _selectedDates == null
                  ? 'Select dates'
                  : '${DateFormat('MMM dd').format(_selectedDates!.start)} - ${DateFormat('MMM dd').format(_selectedDates!.end)}',
              Icons.calendar_month_rounded,
              _openDatePicker,
            ),
            const SizedBox(height: 16),
            _buildTripDetailItem(
              'Guests',
              '$_guests guest${_guests > 1 ? 's' : ''}',
              Icons.group_rounded,
              _openGuestPicker,
            ),
            
            const SizedBox(height: 32),
            const Text(
              'Price Details',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 16),
            
            // Price Breakdown
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF131620),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                children: [
                  _buildPriceRow('₦${widget.property['basePrice']} x ${_getNights()} nights', '₦${_getSubtotal()}'),
                  const SizedBox(height: 12),
                  _buildPriceRow('Service fee', '₦${_getServiceFee()}'),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Divider(color: Colors.white10),
                  ),
                  _buildPriceRow('Total', '₦${_getTotal()}', isTotal: true),
                ],
              ),
            ),
            
            const SizedBox(height: 48),
            
            // Confirm Button
            Consumer<BookingProvider>(
              builder: (context, bookingProvider, child) {
                return SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: _selectedDates == null || bookingProvider.isLoading
                        ? null
                        : _handleCreateBooking,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConstants.primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      shadowColor: AppConstants.primaryColor.withValues(alpha: 0.4),
                      elevation: 10,
                      disabledBackgroundColor: Colors.white.withValues(alpha: 0.1),
                    ),
                    child: bookingProvider.isLoading
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                          )
                        : const Text(
                            'CONFIRM & PAY',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                              letterSpacing: 1.5,
                            ),
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

  Widget _buildTripDetailItem(String title, String value, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white24),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
            ),
            const Text('Edit', style: TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: isTotal ? Colors.white : Colors.white70,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 20 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: isTotal ? AppConstants.primaryColor : Colors.white,
          ),
        ),
      ],
    );
  }

  void _openDatePicker() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const BookingDatePickerScreen()),
    );

    if (result != null && result is DateTimeRange) {
      setState(() => _selectedDates = result);
    }
  }
  
  void _openGuestPicker() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => BookingGuestScreen(
        initialGuests: _guests,
        maxGuests: widget.property['maxGuests'] ?? 4,
      )),
    );

    if (result != null && result is int) {
      setState(() => _guests = result);
    }
  }

  int _getNights() {
    if (_selectedDates == null) return 0;
    final nights = _selectedDates!.duration.inDays;
    return nights > 0 ? nights : 1; // Minimum 1 night
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

  void _handleCreateBooking() {
    Navigator.pushNamed(
      context,
      '/checkout',
      arguments: {
        'propertyId': widget.property['id'],
        'startDate': _selectedDates!.start.toIso8601String(),
        'endDate': _selectedDates!.end.toIso8601String(),
        'guests': _guests,
        'totalPrice': _getTotal(),
        'status': 'confirmed',
      },
    );
  }
}


