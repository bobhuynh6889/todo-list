import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Input, Button } from '../common';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../../types';
import { colors } from '../../constants/colors';
import {
  padding,
  margin,
  fontSize,
  isTablet,
  isIOS,
} from '../../utils/responsive';

interface TodoFormProps {
  visible: boolean;
  todo?: Todo;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => void;
  onClose: () => void;
  loading?: boolean;
}

export function TodoForm({
  visible,
  todo,
  onSubmit,
  onClose,
  loading = false,
}: TodoFormProps): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isEditMode = !!todo;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setTitleError('');
  }, [todo, visible]);

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    onSubmit(data);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setTitleError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={isTablet ? 'formSheet' : 'pageSheet'}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        style={[styles.container, isDark && styles.containerDark]}
      >
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            {isEditMode ? 'Edit Todo' : 'New Todo'}
          </Text>
          <View style={styles.headerButton} />
        </View>

        {/* Form content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Title *"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter todo title"
            error={titleError}
            autoFocus
            maxLength={100}
          />

          <Input
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            maxLength={500}
            style={styles.descriptionInput}
          />

          <Button
            title={isEditMode ? 'Update Todo' : 'Add Todo'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.antiFlashWhite,
  },
  containerDark: {
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: padding.lg,
    paddingVertical: padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  headerDark: {
    backgroundColor: colors.eerieBlack,
    borderBottomColor: colors.darkGray,
  },
  headerButton: {
    width: 80,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.black,
  },
  headerTitleDark: {
    color: colors.white,
  },
  cancelText: {
    fontSize: fontSize.lg,
    color: colors.blue,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: padding.lg,
    paddingBottom: padding.xxl,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: margin.sm,
  },
});
