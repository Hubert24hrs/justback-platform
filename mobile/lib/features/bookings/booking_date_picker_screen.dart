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
                    // Quick duration options
                    _buildQuickDurationSelector(),
                    const SizedBox(height: 20),
                    
                    // Instruction text
                    Text(
                      _selectedStartDay == null 
                          ? 'Tap to select check-in date'
                          : _selectedEndDay == null 
                              ? 'Tap another date for check-out'
                              : 'Tap to change dates',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.6),
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildMonthSelector(),
                    const SizedBox(height: 12),
                    _buildWeekdayHeaders(),
                    const SizedBox(height: 8),
                    _buildCalendarGrid(),
                    const SizedBox(height: 24),
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

  Widget _buildQuickDurationSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Select',
          style: TextStyle(color: Colors.white70, fontSize: 13),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            _buildDurationChip('3 Days', 3),
            const SizedBox(width: 8),
            _buildDurationChip('1 Week', 7),
            const SizedBox(width: 8),
            _buildDurationChip('1 Month', 30),
            const SizedBox(width: 8),
            _buildDurationChip('1 Year', 365),
          ],
        ),
      ],
    );
  }

  Widget _buildDurationChip(String label, int days) {
    final isSelected = _selectedStartDay != null && 
        _selectedEndDay != null && 
        _selectedEndDay!.difference(_selectedStartDay!).inDays == days;
    
    return Expanded(
      child: GestureDetector(
        onTap: () => _selectDuration(days),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected 
                ? AppConstants.primaryColor 
                : Colors.white.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected 
                  ? AppConstants.primaryColor 
                  : Colors.white.withValues(alpha: 0.1),
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? Colors.black : Colors.white,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }

  void _selectDuration(int days) {
    final start = _selectedStartDay ?? DateTime.now();
    setState(() {
      _selectedStartDay = start;
      _selectedEndDay = start.add(Duration(days: days));
    });
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
          TextButton(
            onPressed: _selectedStartDay != null ? () {
              setState(() {
                _selectedStartDay = null;
                _selectedEndDay = null;
              });
            } : null,
            child: Text(
              'Clear',
              style: TextStyle(
                color: _selectedStartDay != null 
                    ? AppConstants.primaryColor 
                    : Colors.transparent,
              ),
            ),
          ),
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

  Widget _buildWeekdayHeaders() {
    final weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: weekdays.map((day) => SizedBox(
        width: 40,
        child: Text(
          day,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.5),
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      )).toList(),
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
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      itemCount: daysInMonth + prevMonthDays,
      itemBuilder: (context, index) {
        if (index < prevMonthDays) return const SizedBox();
        
        final day = index - prevMonthDays + 1;
        final date = DateTime(_focusedDay.year, _focusedDay.month, day);
        final isStartDate = _selectedStartDay != null && DateUtils.isSameDay(date, _selectedStartDay);
        final isEndDate = _selectedEndDay != null && DateUtils.isSameDay(date, _selectedEndDay);
        final isSelected = isStartDate || isEndDate;
        final isInRange = _isDateInRange(date);
        final isToday = DateUtils.isSameDay(date, DateTime.now());
        final isPast = date.isBefore(DateTime.now().subtract(const Duration(days: 1)));
        
        return GestureDetector(
          onTap: isPast ? null : () => _onDateSelected(date),
          child: Container(
            decoration: BoxDecoration(
              color: isSelected 
                  ? AppConstants.primaryColor 
                  : isInRange 
                      ? AppConstants.primaryColor.withValues(alpha: 0.2)
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: isToday && !isSelected 
                  ? Border.all(color: AppConstants.primaryColor, width: 2) 
                  : null,
            ),
            alignment: Alignment.center,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '$day',
                  style: TextStyle(
                    color: isPast 
                        ? Colors.white24 
                        : isSelected 
                            ? Colors.black 
                            : Colors.white,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 15,
                  ),
                ),
                if (isStartDate || isEndDate)
                  Text(
                    isStartDate ? 'In' : 'Out',
                    style: TextStyle(
                      color: Colors.black.withValues(alpha: 0.7),
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  bool _isDateInRange(DateTime date) {
    if (_selectedStartDay == null || _selectedEndDay == null) return false;
    return date.isAfter(_selectedStartDay!) && date.isBefore(_selectedEndDay!);
  }

  void _onDateSelected(DateTime date) {
    setState(() {
      if (_selectedStartDay == null) {
        // First selection - set as start, no auto-select end
        _selectedStartDay = date;
        _selectedEndDay = null;
      } else if (_selectedEndDay == null) {
        // Second selection - set as end (or swap if before start)
        if (date.isBefore(_selectedStartDay!)) {
          _selectedEndDay = _selectedStartDay;
          _selectedStartDay = date;
        } else if (date.isAfter(_selectedStartDay!)) {
          _selectedEndDay = date;
        } else {
          // Same date tapped - set next day as end
          _selectedEndDay = date.add(const Duration(days: 1));
        }
      } else {
        // Both selected - start fresh
        _selectedStartDay = date;
        _selectedEndDay = null;
      }
    });
  }

  Widget _buildSummaryFooter() {
    if (_selectedStartDay == null) return const SizedBox();
    
    final days = _selectedEndDay != null 
        ? _selectedEndDay!.difference(_selectedStartDay!).inDays 
        : 0;

    return GlassBox(
      borderRadius: 20,
      opacity: 0.1,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            _buildDateInfo('Check-In', _selectedStartDay!),
            Container(height: 40, width: 1, color: Colors.white24, margin: const EdgeInsets.symmetric(horizontal: 16)),
            _buildDateInfo('Check-Out', _selectedEndDay),
            const Spacer(),
            if (days > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppConstants.primaryColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$days ${days == 1 ? 'Night' : 'Nights'}',
                  style: const TextStyle(
                    color: AppConstants.primaryColor, 
                    fontWeight: FontWeight.bold, 
                    fontSize: 14,
                  ),
                ),
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
          date != null ? DateFormat('MMM dd').format(date) : 'Select',
          style: TextStyle(
            color: date != null ? Colors.white : AppConstants.primaryColor, 
            fontWeight: FontWeight.bold, 
            fontSize: 16,
          ),
        ),
      ],
    );
  }
  
  Widget _buildBottomBar(BuildContext context) {
    final bool canContinue = _selectedStartDay != null && _selectedEndDay != null;
    final days = canContinue ? _selectedEndDay!.difference(_selectedStartDay!).inDays : 0;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0D14),
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!canContinue)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                _selectedStartDay == null 
                    ? 'Select your check-in date from the calendar'
                    : 'Now select your check-out date',
                style: TextStyle(
                  color: AppConstants.primaryColor.withValues(alpha: 0.8),
                  fontSize: 13,
                ),
              ),
            ),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: canContinue
                  ? () {
                      Navigator.pop(context, DateTimeRange(start: _selectedStartDay!, end: _selectedEndDay!));
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConstants.primaryColor,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                disabledBackgroundColor: Colors.white.withValues(alpha: 0.1),
                disabledForegroundColor: Colors.white38,
              ),
              child: Text(
                canContinue ? 'CONTINUE · $days ${days == 1 ? 'NIGHT' : 'NIGHTS'}' : 'SELECT DATES',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
