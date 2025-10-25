/**
 * FuelProductForm
 *
 * Reusable form component for adding and editing fuel products.
 * Uses react-hook-form with Zod validation.
 * Norwegian labels and placeholders throughout.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fuelProductSchema, FuelProductFormData } from '../../validation/schemas';

interface FuelProductFormProps {
  initialValues?: Partial<FuelProductFormData>;
  onSubmit: (data: FuelProductFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const productTypeButtons = [
  { value: 'gel', label: 'Gel' },
  { value: 'drink', label: 'Drikke' },
  { value: 'bar', label: 'Bar' },
  { value: 'food', label: 'Mat' },
];

export const FuelProductForm: React.FC<FuelProductFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Lagre',
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FuelProductFormData>({
    resolver: zodResolver(fuelProductSchema),
    defaultValues: initialValues || {
      name: '',
      product_type: 'gel',
      carbs_per_serving: undefined,
      serving_size: '',
      notes: '',
    },
    mode: 'onChange',
  });

  const onSubmitForm = async (data: FuelProductFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Produktnavn field */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <TextInput
              label="Produktnavn *"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.name}
              placeholder="f.eks. Maurten Gel 100"
              mode="outlined"
              style={styles.input}
            />
            {errors.name && (
              <HelperText type="error" visible={!!errors.name}>
                {errors.name.message}
              </HelperText>
            )}
          </View>
        )}
      />

      {/* Produkttype field */}
      <Controller
        control={control}
        name="product_type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge" style={styles.label}>
              Produkttype *
            </Text>
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={productTypeButtons}
              style={styles.segmentedButtons}
            />
            {errors.product_type && (
              <HelperText type="error" visible={!!errors.product_type}>
                {errors.product_type.message}
              </HelperText>
            )}
          </View>
        )}
      />

      {/* Karbohydrater per porsjon field */}
      <Controller
        control={control}
        name="carbs_per_serving"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <TextInput
              label="Karbohydrater per porsjon (g) *"
              value={value?.toString() || ''}
              onChangeText={(text) => {
                const numValue = parseFloat(text);
                onChange(isNaN(numValue) ? undefined : numValue);
              }}
              onBlur={onBlur}
              error={!!errors.carbs_per_serving}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />
            {errors.carbs_per_serving && (
              <HelperText type="error" visible={!!errors.carbs_per_serving}>
                {errors.carbs_per_serving.message}
              </HelperText>
            )}
          </View>
        )}
      />

      {/* Porsjonstørrelse field (optional) */}
      <Controller
        control={control}
        name="serving_size"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <TextInput
              label="Porsjonstørrelse (valgfritt)"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.serving_size}
              placeholder="f.eks. 40g pakke, 500ml flaske"
              mode="outlined"
              style={styles.input}
            />
            {errors.serving_size && (
              <HelperText type="error" visible={!!errors.serving_size}>
                {errors.serving_size.message}
              </HelperText>
            )}
          </View>
        )}
      />

      {/* Notater field (optional) */}
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <TextInput
              label="Notater (valgfritt)"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={!!errors.notes}
              placeholder="f.eks. Min favoritt-gel"
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            {errors.notes && (
              <HelperText type="error" visible={!!errors.notes}>
                {errors.notes.message}
              </HelperText>
            )}
          </View>
        )}
      />

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmitForm)}
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          style={styles.submitButton}
        >
          {submitLabel}
        </Button>
        <Button
          mode="outlined"
          onPress={onCancel}
          disabled={isSubmitting}
          style={styles.cancelButton}
        >
          Avbryt
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#424242',
  },
  input: {
    backgroundColor: '#ffffff',
  },
  segmentedButtons: {
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  submitButton: {
    paddingVertical: 6,
  },
  cancelButton: {
    paddingVertical: 6,
  },
});
