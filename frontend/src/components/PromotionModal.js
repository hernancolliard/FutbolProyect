import React from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import './PromotionModal.css';

const PromotionModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="promotion-modal-content">
                <button onClick={onClose} className="close-button">X</button>
                <h2>{t('promotionModal.title')}</h2>
                <p>{t('promotionModal.description')}</p>
                <div className="buttons-container">
                    <a href="/register?role=player" className="modal-button">{t('promotionModal.registerPlayer')}</a>
                    <a href="/register?role=club" className="modal-button">{t('promotionModal.registerClub')}</a>
                </div>
            </div>
        </Modal>
    );
};

export default PromotionModal;
