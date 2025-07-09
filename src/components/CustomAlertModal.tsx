// components/CustomAlertModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';

interface CustomAlertModalProps {
  isVisible: boolean;
  title?: string;
  message?: string; // ✨ message를 선택적(optional)으로 변경
  onClose: () => void;
  confirmText?: string;
}

const { width } = Dimensions.get('window');

export function CustomAlertModal({
  isVisible,
  title,
  message, // message는 이제 선택적
  onClose,
  confirmText = '확인',
}: CustomAlertModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.centeredView} onPress={onClose}>
        <View style={styles.modalView}>
          {/* title이 있을 때만 렌더링 */}
          {title && <Text style={styles.modalTitle}>{title}</Text>}
          {/* ✨ message가 있을 때만 렌더링 */}
          {message && <Text style={styles.modalMessage}>{message}</Text>}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>{confirmText}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.8,
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e71d36',
    width: '100%',
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});