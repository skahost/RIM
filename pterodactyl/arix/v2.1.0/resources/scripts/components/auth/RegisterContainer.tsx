import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import register from '@/api/auth/register';
import RegisterFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { UserCircleIcon, AtSymbolIcon, KeyIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import Turnstile, { useTurnstile } from 'react-turnstile';
import { useTranslation } from 'react-i18next';

interface Values {
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    passwordConfirmation: string;
}

const RegisterContainer = () => {
    const ref = useRef<Reaptcha>(null);
    const turnstile = useTurnstile();
    const [token, setToken] = useState('');
    const [eyeOpen, setEyeOpen] = useState(false);
    const [confirmEyeOpen, setConfirmEyeOpen] = useState(false);
    const { t } = useTranslation('arix/auth');

    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const { recaptcha: recaptchaSettings, turnstile: turnstileSettings } = useStoreState(
        (state) => state.settings.data!
    );

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaSettings.enabled && recaptchaSettings.method && !token) {
            if (recaptchaSettings.method === 'recaptcha') {
                ref.current!.execute().catch((error) => {
                    console.error(error);

                    setSubmitting(false);
                    clearAndAddHttpError({ error });
                });
            } else if (recaptchaSettings.method === 'turnstile') {
                turnstile.execute().catch((error: unknown) => {
                    console.error(error);

                    setSubmitting(false);
                    clearAndAddHttpError({ error: error as Error });
                });
            }

            return;
        }

        register({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    addFlash({
                        type: 'success',
                        title: 'Success',
                        message: t('register.success-message'),
                    });

                    setSubmitting(false);
                }
            })
            .catch((error) => {
                console.error(error);

                setToken('');
                if (recaptchaSettings.enabled && recaptchaSettings.method) {
                    if (recaptchaSettings.method === 'recaptcha') {
                        ref.current!.reset();
                    } else if (recaptchaSettings.method === 'turnstile') {
                        turnstile.reset();
                    }
                }

                let message = t('register.valid-username-required');
                const payload = error?.config?.data ? JSON.parse(error.config.data) : {};

                if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9]$/.test(payload.username || '')) {
                    message = t('register.valid-username-required');
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || '')) {
                    message = t('register.valid-email-required');
                }

                setSubmitting(false);
                if (typeof message === 'string') {
                    addFlash({
                        type: 'error',
                        title: 'Error',
                        message,
                    });
                } else {
                    clearAndAddHttpError({ error });
                }
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ email: '', username: '', firstname: '', lastname: '', password: '', passwordConfirmation: '' }}
            validationSchema={object().shape({
                email: string().required(t('register.email-required')),
                username: string().required(t('register.username-required')),
                firstname: string().required(t('register.firstname-required')),
                lastname: string().required(t('register.lastname-required')),
                password: string().required(t('register.password-required')).min(8, t('register.password-min-length')),
                passwordConfirmation: string()
                    .required(t('register.confirm-password-required'))
                    .oneOf([ref('password')], t('register.passwords-do-not-match')),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <RegisterFormContainer title={t('register.title')} css={tw`w-full flex`}>
                    <div className='grid lg:grid-cols-2 gap-4 w-full'>
                        <Field
                            type={'text'}
                            label={t('register.firstname')}
                            name={'firstname'}
                            placeholder={t('register.firstname')}
                            disabled={isSubmitting}
                            icon={UserCircleIcon}
                        />
                        <Field
                            type={'text'}
                            label={t('register.lastname')}
                            name={'lastname'}
                            placeholder={t('register.lastname')}
                            disabled={isSubmitting}
                            icon={UserCircleIcon}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            type={'text'}
                            label={t('register.username')}
                            name={'username'}
                            placeholder={t('register.username')}
                            disabled={isSubmitting}
                            icon={UserCircleIcon}
                        />
                    </div>
                    <div css={tw`mt-6 mb-3`}>
                        <Field
                            type={'email'}
                            label={t('register.email')}
                            name={'email'}
                            placeholder={t('register.email')}
                            disabled={isSubmitting}
                            icon={AtSymbolIcon}
                        />
                    </div>
                    <div css={tw`mt-6 mb-3`}>
                        <div className={'flex justify-between'}>
                            <label className={'block text-sm text-gray-300 mb-1 sm:mb-2 font-light'}>
                                {t('register.password')}
                            </label>
                        </div>
                        <div className={'relative'}>
                            <Field
                                type={eyeOpen ? 'text' : 'password'}
                                placeholder={t('register.password')}
                                name={'password'}
                                disabled={isSubmitting}
                                icon={KeyIcon}
                            />
                            <button
                                type={'button'}
                                className={'absolute top-2 right-2 p-1 text-gray-300'}
                                onClick={() => setEyeOpen(!eyeOpen)}
                            >
                                {eyeOpen ? <EyeOffIcon className={'w-5'} /> : <EyeIcon className={'w-5'} />}
                            </button>
                        </div>
                    </div>
                    <div css={tw`mt-6 mb-3`}>
                        <div className={'flex justify-between'}>
                            <label className={'block text-sm text-gray-300 mb-1 sm:mb-2 font-light'}>
                                {t('register.confirm-password')}
                            </label>
                        </div>
                        <div className={'relative'}>
                            <Field
                                type={confirmEyeOpen ? 'text' : 'password'}
                                placeholder={t('register.confirm-password')}
                                name={'passwordConfirmation'}
                                disabled={isSubmitting}
                                icon={KeyIcon}
                            />
                            <button
                                type={'button'}
                                className={'absolute top-2 right-2 p-1 text-gray-300'}
                                onClick={() => setConfirmEyeOpen(!confirmEyeOpen)}
                            >
                                {confirmEyeOpen ? <EyeOffIcon className={'w-5'} /> : <EyeIcon className={'w-5'} />}
                            </button>
                        </div>
                    </div>
                    <div className={'z-50 relative'}>
                        {recaptchaSettings.enabled &&
                            recaptchaSettings.method &&
                            (recaptchaSettings.method === 'recaptcha' ? (
                                <Reaptcha
                                    ref={ref}
                                    size={'invisible'}
                                    sitekey={recaptchaSettings.siteKey || '_invalid_key'}
                                    onVerify={(response) => {
                                        setToken(response);
                                        submitForm();
                                    }}
                                    onExpire={() => {
                                        setSubmitting(false);
                                        setToken('');
                                    }}
                                />
                            ) : (
                                recaptchaSettings.method === 'turnstile' && (
                                    <Turnstile
                                        sitekey={turnstileSettings.siteKey || '_invalid_key'}
                                        execution='render'
                                        appearance='always'
                                        onVerify={(response) => {
                                            setToken(response);
                                        }}
                                        onExpire={() => {
                                            setSubmitting(false);
                                            setToken('');
                                        }}
                                    />
                                )
                            ))}
                    </div>
                    <div css={tw`mt-3`}>
                        <Button type={'submit'} className={'w-full !py-3'} disabled={isSubmitting}>
                            {t('register.register')}
                        </Button>
                    </div>
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-300 tracking-wide uppercase no-underline hover:text-neutral-200`}
                        >
                            {t('register.already-have-account')}
                        </Link>
                    </div>
                </RegisterFormContainer>
            )}
        </Formik>
    );
};

export default RegisterContainer;
