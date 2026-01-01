import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/host_provider.dart';
import '../../core/constants/app_constants.dart';

class AddPropertyScreen extends StatefulWidget {
  const AddPropertyScreen({Key? key}) : super(key: key);

  @override
  State<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _AddPropertyScreenState extends State<AddPropertyScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Form Fields
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  String _category = 'Apartment';
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  int _bedrooms = 1;
  int _bathrooms = 1;
  int _maxGuests = 2;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Property'),
      ),
      body: Stepper(
        type: StepperType.horizontal,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep += 1);
          } else {
            _handleSave();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          }
        },
        steps: [
          _buildBasicInfoStep(),
          _buildLocationStep(),
          _buildAmenitiesStep(),
        ],
      ),
    );
  }

  Step _buildBasicInfoStep() {
    return Step(
      title: const Text('Info'),
      isActive: _currentStep >= 0,
      content: Form(
        child: Column(
          children: [
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Property Title'),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _category,
              decoration: const InputDecoration(labelText: 'Category'),
              items: ['Apartment', 'House', 'Villa', 'Studio']
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (v) => setState(() => _category = v!),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(labelText: 'Price per night (₦)'),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
      ),
    );
  }

  Step _buildLocationStep() {
    return Step(
      title: const Text('Location'),
      isActive: _currentStep >= 1,
      content: Column(
        children: [
          TextFormField(
            controller: _addressController,
            decoration: const InputDecoration(labelText: 'Address'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _cityController,
            decoration: const InputDecoration(labelText: 'City'),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _stateController,
            decoration: const InputDecoration(labelText: 'State'),
          ),
        ],
      ),
    );
  }

  Step _buildAmenitiesStep() {
    return Step(
      title: const Text('Amenity'),
      isActive: _currentStep >= 2,
      content: Column(
        children: [
          _buildCounterRow('Bedrooms', _bedrooms, (v) => setState(() => _bedrooms = v)),
          _buildCounterRow('Bathrooms', _bathrooms, (v) => setState(() => _bathrooms = v)),
          _buildCounterRow('Max Guests', _maxGuests, (v) => setState(() => _maxGuests = v)),
        ],
      ),
    );
  }

  Widget _buildCounterRow(String label, int value, Function(int) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 16)),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline),
                onPressed: value > 1 ? () => onChanged(value - 1) : null,
              ),
              Text('$value', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_outline),
                onPressed: () => onChanged(value + 1),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _handleSave() async {
    final provider = context.read<HostProvider>();
    final success = await provider.addProperty({
      'title': _titleController.text,
      'category': _category,
      'description': _descriptionController.text,
      'basePrice': double.tryParse(_priceController.text) ?? 0,
      'address': _addressController.text,
      'city': _cityController.text,
      'state': _stateController.text,
      'bedrooms': _bedrooms,
      'bathrooms': _bathrooms,
      'maxGuests': _maxGuests,
      'amenities': ['WiFi', 'Security'], // Mocked for now
    });

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Property added successfully!')),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'Failed to add property')),
      );
    }
  }
}
