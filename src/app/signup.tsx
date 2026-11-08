import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { BackButton, Button, Checkbox, FieldError, Hint, SectionLabel, TextField, TextLink } from '@/components/Controls';
import { StudentFigure, type StudentLook } from '@/components/Illustrations';
import { UniversityPicker } from '@/components/UniversityPicker';
import { UploadSlot, type IdPhoto } from '@/components/UploadSlot';
import { errorMessage } from '@/lib/api';
import type { Gender } from '@/lib/api/types';
import { notBuiltYet } from '@/lib/placeholder';
import { isGmail, MIN_PASSWORD_LENGTH, passwordStrength } from '@/lib/validation';
import { useSession } from '@/state/session';
import colors from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

type Errors = {
  name?: string;
  email?: string;
  university?: string;
  password?: string;
  gender?: string;
  studentId?: string;
  terms?: string;
};

const GENDERS: { value: Gender; label: string; look: StudentLook }[] = [
  { value: 'male', label: 'Male', look: { hair: 'short', bag: 'backpack', leftArm: 'wave' } },
  { value: 'female', label: 'Female', look: { hair: 'long', top: 'sleeveless', leftArm: 'wave' } },
];

type GenderCardProps = {
  label: string;
  look: StudentLook;
  selected: boolean;
  onPress: () => void;
};

function GenderCard({ label, look, selected, onPress }: GenderCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={`flex-1 overflow-hidden rounded-2xl border-[1.5px] bg-white ${selected ? 'border-loop' : 'border-line'}`}
    >
      <View className={`items-center pt-3 ${selected ? 'bg-loop/10' : ''}`}>
        <StudentFigure width={88} {...look} />
      </View>
      <View className="flex-row items-center justify-between px-3 py-2.5">
        <Text className="font-body-bold text-[14.5px] text-ink">{label}</Text>
        <View className={`h-5 w-5 items-center justify-center rounded-full ${selected ? 'bg-loop' : 'border-[1.5px] border-line'}`}>
          {selected && <View className="h-2 w-2 rounded-full bg-white" />}
        </View>
      </View>
    </Pressable>
  );
}

export default function SignupRoute() {
  const { register } = useSession();
  const { previewTheme, university } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [front, setFront] = useState<IdPhoto | null>(null);
  const [back, setBack] = useState<IdPhoto | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // The whole screen takes on the chosen campus's colours straight away.
  useEffect(() => {
    previewTheme(universityId);
  }, [previewTheme, universityId]);
  useEffect(() => () => previewTheme(null), [previewTheme]);

  const strength = passwordStrength(password);

  const problems: Errors = {
    name: name.trim() ? undefined : 'Enter your full name.',
    email: isGmail(email) ? undefined : 'Enter your Gmail address, like name@gmail.com.',
    university: universityId ? undefined : 'Choose your university.',
    password: password.length >= MIN_PASSWORD_LENGTH ? undefined : `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    gender: gender ? undefined : 'Choose one to continue.',
    studentId: front && back ? undefined : 'Add both sides of your student ID.',
    terms: agreed ? undefined : 'Agree to the Terms and Privacy Policy to continue.',
  };
  // Stay quiet until the first submit, then each message clears as it is fixed.
  const errors: Errors = submitted ? problems : {};

  const submit = async () => {
    setSubmitted(true);
    setFormError(null);
    if (Object.values(problems).some(Boolean) || !universityId || !gender || !front || !back) return;

    setBusy(true);
    try {
      await register({
        fullName: name,
        email,
        password,
        universityId,
        gender,
        studentIdFront: front.uri,
        studentIdBack: back.uri,
      });
      router.replace('/verification');
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      hero={
        <View>
          <BackButton onPress={() => router.replace('/welcome')} />
          <Text className="mt-5 font-body-bold text-[13px] tracking-[1.6px] text-highlight">
            {university ? `SIGN UP · ${university.short}` : 'SIGN UP'}
          </Text>
          <Text accessibilityRole="header" className="mt-1 font-heading text-[32px] leading-[38px] text-white">
            Create your account
          </Text>
          <Text className="mt-2 font-body text-[15px] leading-[21px] text-white/80">
            One page, about 2 minutes. Use your Gmail, then pick your campus.
          </Text>
        </View>
      }
    >
      <SectionLabel>1 · ACCOUNT</SectionLabel>
      <View className="mt-3 gap-4">
        <TextField
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          error={errors.name}
        />
        <TextField
          label="Gmail"
          value={email}
          onChangeText={setEmail}
          placeholder="name@gmail.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          error={errors.email}
        />
        <View>
          <UniversityPicker value={universityId} onChange={setUniversityId} error={errors.university} />
          {!errors.university && <Hint>Your campus sets your market and the app’s colours.</Hint>}
        </View>
        <View>
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            secret
            error={errors.password}
          />
          <View className="mt-3 flex-row items-center gap-1.5">
            {[1, 2, 3, 4].map((level) => (
              <View key={level} className={`h-1.5 flex-1 rounded-full ${level <= strength.score ? 'bg-mint' : 'bg-line'}`} />
            ))}
            {strength.label ? (
              <Text
                className="ml-1 font-body-bold text-[12.5px]"
                style={{ color: strength.score >= 3 ? colors.mint.deep : colors.muted }}
              >
                {strength.label}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="mt-7">
        <SectionLabel>2 · GENDER</SectionLabel>
        <View accessibilityRole="radiogroup" className="mt-3 flex-row gap-3">
          {GENDERS.map((option) => (
            <GenderCard
              key={option.value}
              label={option.label}
              look={option.look}
              selected={gender === option.value}
              onPress={() => setGender(option.value)}
            />
          ))}
        </View>
        <FieldError message={errors.gender} />
        <Hint>You’ll get a random look after sign-up. Change it in Profile.</Hint>
      </View>

      <View className="mt-7">
        <SectionLabel>3 · STUDENT ID</SectionLabel>
        <Text className="mt-2 font-body text-[14px] text-muted">
          Front and back of your {university ? `${university.short} ` : ''}student card. Only our team sees it.
        </Text>
        <View className="mt-3 gap-3">
          <UploadSlot label="Front side" photo={front} onChange={setFront} />
          <UploadSlot label="Back side" photo={back} onChange={setBack} />
        </View>
        <FieldError message={errors.studentId} />
        <Hint>Clear photo, no glare. All details must be readable.</Hint>
      </View>

      <View className="mt-6">
        <Checkbox checked={agreed} onChange={setAgreed} label="I agree to the Terms and Privacy Policy">
          <Text className="font-body text-[14.5px] text-muted">
            I agree to the <TextLink label="Terms" onPress={() => notBuiltYet('Terms')} /> and{' '}
            <TextLink label="Privacy Policy" onPress={() => notBuiltYet('Privacy Policy')} />
          </Text>
        </Checkbox>
        <FieldError message={errors.terms} />
      </View>

      <FieldError message={formError ?? undefined} />
      <Button label="Create account" className="mt-6" onPress={submit} loading={busy} />

      <Text className="mt-6 text-center font-body text-[15px] text-muted">
        Already have an account? <TextLink label="Log in" onPress={() => router.replace('/login')} />
      </Text>
    </AuthScreen>
  );
}
