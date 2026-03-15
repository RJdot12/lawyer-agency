import type { Alpine } from 'alpinejs';

export default (Alpine: Alpine) => {
    // Register contactForm component before Alpine starts
    Alpine.data('contactForm', () => ({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
        submitted: false,
        submitting: false,
        errors: {} as Record<string, string>,

        validateName() {
            if (!this.name.trim()) {
                this.errors.name = 'Будь ласка, введіть ваше ПІБ';
                return false;
            }
            delete this.errors.name;
            return true;
        },

        validateEmail() {
            if (!this.email.trim()) {
                this.errors.email = 'Будь ласка, введіть електронну пошту';
                return false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
                this.errors.email = 'Будь ласка, введіть коректну електронну адресу';
                return false;
            }
            delete this.errors.email;
            return true;
        },

        validatePhone() {
            if (!this.phone.trim()) {
                this.errors.phone = 'Будь ласка, введіть ваш номер телефону';
                return false;
            }
            // Check if phone contains only valid characters
            if (!/^[+\d\s\-().]+$/.test(this.phone)) {
                this.errors.phone = 'Номер телефону містить недопустимі символи';
                return false;
            }
            // Check if phone contains at least 10 digits
            const digitsOnly = this.phone.replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                this.errors.phone = 'Номер телефону має містити мінімум 10 цифр';
                return false;
            }
            delete this.errors.phone;
            return true;
        },

        validateService() {
            if (!this.service) {
                this.errors.service = 'Будь ласка, оберіть послугу';
                return false;
            }
            delete this.errors.service;
            return true;
        },

        validateForm() {
            // Run all validations
            const nameValid = this.validateName();
            const emailValid = this.validateEmail();
            const phoneValid = this.validatePhone();
            const serviceValid = this.validateService();

            return nameValid && emailValid && phoneValid && serviceValid;
        },

        async submitForm(event: Event) {
            if (!this.validateForm()) {
                return;
            }

            this.submitting = true;
            this.errors = {};

            try {
                const form = event.target as HTMLFormElement;
                const scriptUrl = form.dataset.scriptUrl;
                const secretKey = form.dataset.secretKey;

                if (!scriptUrl || !secretKey) {
                    throw new Error('Configuration missing. Please check .env file.');
                }

                const formData = {
                    name: this.name,
                    email: this.email,
                    phone: this.phone,
                    service: this.service,
                    message: this.message,
                    secretKey: secretKey
                };

                await fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                this.submitted = true;

            } catch (error) {
                console.error('Submission error:', error);
                this.errors.submit = 'Не вдалося відправити форму. ' + (error as Error).message;
            } finally {
                this.submitting = false;
            }
        }
    }));
};
