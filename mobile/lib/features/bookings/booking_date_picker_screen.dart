import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';
import 'package:intl/intl.dart';

class BookingDatePickerScreen extends StatefulWidget {
  const BookingDatePickerScreen({super.key});

  @override
  State<BookingDatePickerScreen> createState() => _BookingDatePickerScreenState();
}

class _BookingDatePickerScreenState extends State<BookingDatePickerScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedStartDay;
  DateTime? _selectedEndDay;

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
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    _buildMonthSelector(),
                    const SizedBox(height: 20),
                    _buildCalendarGrid(),
                    const SizedBox(height: 30),
                    _buildSummaryFooter(),
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
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
            style: IconButton.styleFrom(
              padding: EdgeInsets.zero,
              backgroundColor: Colors.white.withValues(alpha: 0.05),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const Text(
            'Select Dates',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(width: 40), // Balance
        ],
      ),
    );
  }

  Widget _buildMonthSelector() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        IconButton(
          onPressed: () {
            setState(() {
              _focusedDay = DateTime(_focusedDay.year, _focusedDay.month - 1);
            });
          },
          icon: const Icon(Icons.chevron_left_rounded, color: Colors.white70),
        ),
        Text(
          DateFormat('MMMM yyyy').format(_focusedDay).toUpperCase(),
          style: const TextStyle(
            color: AppConstants.primaryColor,
            fontWeight: FontWeight.bold,
            fontSize: 16,
            letterSpacing: 1.5,
          ),
        ),
        IconButton(
          onPressed: () {
            setState(() {
              _focusedDay = DateTime(_focusedDay.year, _focusedDay.month + 1);
            });
          },
          icon: const Icon(Icons.chevron_right_rounded, color: Colors.white70),
        ),
      ],
    );
  }

  Widget _buildCalendarGrid() {
    final daysInMonth = DateUtils.getDaysInMonth(_focusedDay.year, _focusedDay.month);
    final firstDayOfMonth = DateTime(_focusedDay.year, _focusedDay.month, 1);
    final prevMonthDays = firstDayOfMonth.weekday % 7;
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
      ),
      itemCount: daysInMonth + prevMonthDays,
      itemBuilder: (context, index) {
        if (index < prevMonthDays) return const SizedBox();
        
        final day = index - prevMonthDays + 1;
        final date = DateTime(_focusedDay.year, _focusedDay.month, day);
        final isSelected = _isDateSelected(date);
        final isInRange = _isDateInRange(date);
        final isToday = DateUtils.isSameDay(date, DateTime.now());
        
        return GestureDetector(
          onTap: () => _onDateSelected(date),
          child: Container(
            decoration: BoxDecoration(
              color: isSelected 
                  ? AppConstants.primaryColor 
                  : isInRange 
                      ? AppConstants.primaryColor.withValues(alpha: 0.2)
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: isToday && !isSelected 
                  ? Border.all(color: AppConstants.primaryColor) 
                  : null,
            ),
            alignment: Alignment.center,
            child: Text(
              '$day',
              style: TextStyle(
                color: isSelected ? Colors.black : Colors.white,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      },
    );
  }

  bool _isDateSelected(DateTime date) {
    if (_selectedStartDay != null && DateUtils.isSameDay(date, _selectedStartDay)) return true;
    if (_selectedEndDay != null && DateUtils.isSameDay(date, _selectedEndDay)) return true;
    return false;
  }

  bool _isDateInRange(DateTime date) {
    if (_selectedStartDay == null || _selectedEndDay == null) return false;
    return date.isAfter(_selectedStartDay!) && date.isBefore(_selectedEndDay!);
  }

  void _onDateSelected(DateTime date) {
    setState(() {
      if (_selectedStartDay == null || (_selectedStartDay != null && _selectedEndDay != null)) {
        _selectedStartDay = date;
        _selectedEndDay = null;
      } else if (date.isBefore(_selectedStartDay!)) {
        _selectedStartDay = date;
      } else {
        _selectedEndDay = date;
      }
    });
  }

  Widget _buildSummaryFooter() {
    if (_selectedStartDay == null) return const SizedBox();
    
    final days = _selectedEndDay != null 
        ? _selectedEndDay!.difference(_selectedStartDay!).inDays 
        : 1;

    return GlassBox(
      borderRadius: 20,
      opacity: 0.1,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            _buildDateInfo('Check-In', _selectedStartDay!),
            Container(height: 40, width: 1, color: Colors.white24, margin: const EdgeInsets.symmetric(horizontal: 20)),
            _buildDateInfo('Check-Out', _selectedEndDay),
            const Spacer(),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '$days Nights',
                  style: const TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateInfo(String label, DateTime? date) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        const SizedBox(height: 4),
        Text(
          date != null ? DateFormat('MMM dd').format(date) : '--',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ],
    );
  }
  
  Widget _buildBottomBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: _selectedStartDay != null && _selectedEndDay != null
              ? () {
                  Navigator.pop(context, DateTimeRange(start: _selectedStartDay!, end: _selectedEndDay!));
                }
              : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConstants.primaryColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            disabledBackgroundColor: Colors.white.withValues(alpha: 0.1),
          ),
          child: const Text(
            'CONTINUE',
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

