import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';

class BookingGuestScreen extends StatefulWidget {
  final int initialGuests;
  final int maxGuests;

  const BookingGuestScreen({
    Key? key,
    required this.initialGuests,
    required this.maxGuests,
  }) : super(key: key);

  @override
  State<BookingGuestScreen> createState() => _BookingGuestScreenState();
}

class _BookingGuestScreenState extends State<BookingGuestScreen> {
  late int _adults;
  int _children = 0;
  int _infants = 0;

  @override
  void initState() {
    super.initState();
    _adults = widget.initialGuests;
  }

  int get _totalGuests => _adults + _children; // Infants don't count towards max capacity usually

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      body: SafeArea(
        child: Column(
          children: [
             _buildHeader(context),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    _buildGuestRow(
                      'Adults',
                      'Ages 13 or above',
                      _adults,
                      (val) => setState(() => _adults = val),
                    ),
                    const SizedBox(height: 24),
                    _buildGuestRow(
                      'Children',
                      'Ages 2-12',
                      _children,
                      (val) => setState(() => _children = val),
                    ),
                    const SizedBox(height: 24),
                    _buildGuestRow(
                      'Infants',
                      'Under 2',
                      _infants,
                       (val) => setState(() => _infants = val),
                      isInfant: true,
                    ),
                    
                    const SizedBox(height: 48),
                    
                    GlassBox(
                      opacity: 0.05,
                      borderRadius: 16,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline_rounded, color: Colors.white54),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'This property accepts a maximum of ${widget.maxGuests} guests (excluding infants).',
                                style: const TextStyle(color: Colors.white54, fontSize: 13, height: 1.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _buildBottomBar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close_rounded, color: Colors.white),
            style: IconButton.styleFrom(
              padding: EdgeInsets.zero,
              backgroundColor: Colors.white.withOpacity(0.05),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const Text(
            'Guests',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          TextButton(
             onPressed: () {
               setState(() {
                 _adults = 1;
                 _children = 0;
                 _infants = 0;
               });
             },
             child: const Text('Reset', style: TextStyle(color: Colors.white54)),
          ),
        ],
      ),
    );
  }

  Widget _buildGuestRow(String title, String subtitle, int value, Function(int) onChanged, {bool isInfant = false}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF131620), // Slightly lighter than bg
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white38, fontSize: 13),
                ),
              ],
            ),
          ),
          _buildCounterButton(
            Icons.remove,
            value > 0 && (title != 'Adults' || value > 1) 
              ? () {
                  if (title == 'Adults' && value <= 1) return;
                  onChanged(value - 1);
                } 
              : null,
          ),
          SizedBox(
            width: 50,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
          _buildCounterButton(
            Icons.add,
            (isInfant || _totalGuests < widget.maxGuests)
              ? () => onChanged(value + 1)
              : null,
          ),
        ],
      ),
    );
  }

  Widget _buildCounterButton(IconData icon, VoidCallback? onTap) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: onTap != null ? Colors.white24 : Colors.white10,
          width: 1,
        ),
        color: onTap != null ? Colors.white.withOpacity(0.05) : Colors.transparent,
      ),
      child: IconButton(
        padding: EdgeInsets.zero,
        icon: Icon(icon, color: onTap != null ? Colors.white : Colors.white24, size: 20),
        onPressed: onTap,
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: () {
            // Return total guests (capped by max capacity logic handled in UI)
            Navigator.pop(context, _totalGuests);
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConstants.primaryColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text(
            'SAVE',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
        ),
      ),
    );
  }
}
