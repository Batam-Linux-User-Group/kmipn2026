import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface AvatarProps {
  type: 'bunny' | 'sari' | 'jane' | 'siti' | 'user' | 'cool';
  size?: number;
}

export function Avatar({ type, size = 44 }: AvatarProps) {
  const scale = size / 44;

  const renderContent = () => {
    switch (type) {
      case 'cool':
        // Cool pink background, yellow hair, sunglasses, pink shirt
        return (
          <G scale={scale}>
            <Circle cx={22} cy={22} r={22} fill="#FCE4EC" />
            {/* Hair back */}
            <Circle cx={22} cy={17} r={9} fill="#F5B041" />
            {/* Face */}
            <Circle cx={22} cy={20} r={7} fill="#FAD7A0" />
            {/* Sunglasses */}
            <Path d="M17 18h4.5v2h-4.5zM22.5 18H27v2h-4.5z" fill="#1C2833" />
            <Path d="M21 19h2" stroke="#1C2833" strokeWidth={1} />
            {/* Hair front */}
            <Path d="M14 16c2-4 6-4 8-2s4 0 6 2" stroke="#F5B041" strokeWidth={2.5} strokeLinecap="round" />
            {/* Shirt */}
            <Path d="M10 37c2-5 7-8 12-8s10 3 12 8H10z" fill="#EC407A" />
          </G>
        );

      case 'bunny':
        // SweetBunny22: curly hair, purple bg, green top
        return (
          <G scale={scale}>
            <Circle cx={22} cy={22} r={22} fill="#E8DDF2" />
            {/* Curly hair back */}
            <Circle cx={15} cy={16} r={6} fill="#4E342E" />
            <Circle cx={29} cy={16} r={6} fill="#4E342E" />
            <Circle cx={22} cy={13} r={7} fill="#4E342E" />
            {/* Face */}
            <Circle cx={22} cy={20} r={7.5} fill="#D7CCC8" />
            {/* Eyes */}
            <Circle cx={19.5} cy={19} r={1} fill="#3E2723" />
            <Circle cx={24.5} cy={19} r={1} fill="#3E2723" />
            {/* Mouth */}
            <Path d="M20.5 22.5a1.5 1.5 0 003 0" stroke="#3E2723" strokeWidth={1} />
            {/* Shirt */}
            <Path d="M11 36c2-5 6.5-7 11-7s9 2 11 7H11z" fill="#35D4A5" />
          </G>
        );

      case 'sari':
        // Ratna Sari: black hair, green/teal bg, dark green top
        return (
          <G scale={scale}>
            <Circle cx={22} cy={22} r={22} fill="#E0F2F1" />
            {/* Hair back */}
            <Path d="M13 22c0-8 6-10 9-10s9 2 9 10" fill="#212F3D" />
            {/* Face */}
            <Circle cx={22} cy={21} r={7} fill="#FADBD8" />
            {/* Eyes */}
            <Circle cx={19.5} cy={20} r={0.8} fill="#212F3D" />
            <Circle cx={24.5} cy={20} r={0.8} fill="#212F3D" />
            {/* Mouth */}
            <Path d="M21 23.5a1 1 0 002 0" stroke="#212F3D" strokeWidth={0.8} />
            {/* Hair bangs */}
            <Path d="M15 17c3-3 5-1 7-2s4-1 5 2" stroke="#212F3D" strokeWidth={2} strokeLinecap="round" />
            {/* Shirt */}
            <Path d="M12 36c2-4 6-6.5 10-6.5s8 2.5 10 6.5H12z" fill="#0A7E5C" />
          </G>
        );

      case 'jane':
        // JaneDoe999: glasses, red top, brown hair
        return (
          <G scale={scale}>
            <Circle cx={22} cy={22} r={22} fill="#FDEDEC" />
            {/* Hair */}
            <Path d="M12 24c0-7 5-11 10-11s10 4 10 11v3h-2v-3c0-4-3.5-7-8-7s-8 3-8 7v3h-2v-3z" fill="#5D4037" />
            {/* Face */}
            <Circle cx={22} cy={21} r={7} fill="#FBD5C0" />
            {/* Glasses */}
            <Circle cx={19} cy={20} r={2.2} stroke="#1C2833" strokeWidth={1.2} fill="transparent" />
            <Circle cx={25} cy={20} r={2.2} stroke="#1C2833" strokeWidth={1.2} fill="transparent" />
            <Path d="M21.2 20h1.6" stroke="#1C2833" strokeWidth={1.2} />
            {/* Shirt */}
            <Path d="M12 36c2-4 6-6 10-6s8 2 10 6H12z" fill="#E53935" />
          </G>
        );

      case 'siti':
        // Siti Aisyah: bun hair, teal top
        return (
          <G scale={scale}>
            <Circle cx={22} cy={22} r={22} fill="#FFF9E6" />
            {/* Bun hair */}
            <Circle cx={22} cy={11} r={5} fill="#1C2833" />
            {/* Face */}
            <Circle cx={22} cy={20} r={7} fill="#F5CBA7" />
            {/* Eyes */}
            <Circle cx={19.5} cy={19.5} r={0.8} fill="#1C2833" />
            <Circle cx={24.5} cy={19.5} r={0.8} fill="#1C2833" />
            {/* Hair front */}
            <Path d="M15 18a8 8 0 0114 0" fill="#1C2833" />
            {/* Shirt */}
            <Path d="M12 36c2-4 6-6.5 10-6.5s8 2.5 10 6.5H12z" fill="#00ACC1" />
          </G>
        );

      case 'user':
      default:
        // Fawwaz user avatar: mint background, green top, styled hair
        return (
          <G scale={scale}>
            <Circle cx={22} cy={22} r={22} fill="#E0F2F1" />
            {/* Hair */}
            <Path d="M13 18c0-5 4-8 9-8s9 3 9 8v4h-18v-4z" fill="#11221B" />
            {/* Face */}
            <Circle cx={22} cy={21} r={7.5} fill="#FAD7A0" />
            {/* Eyes */}
            <Circle cx={19} cy={20} r={1} fill="#11221B" />
            <Circle cx={25} cy={20} r={1} fill="#11221B" />
            {/* Shirt */}
            <Path d="M11 36c2-4 6-6.5 11-6.5s9 2.5 11 6.5H11z" fill="#056B4E" />
          </G>
        );
    }
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {renderContent()}
    </Svg>
  );
}
