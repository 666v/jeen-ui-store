'use client';

import { AvatarStack } from '@/components/ui/avatar-stack';
import {
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from '@/components/ui/cursor';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const users = [
  {
    id: 1,
    name: 'أحمد محمد',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    id: 2,
    name: 'سارة أحمد',
    avatar: 'https://github.com/shadcn.png',
    message: 'أحب هذا المنتج!',
  },
  {
    id: 3,
    name: 'محمد علي',
    avatar: 'https://github.com/leerob.png',
    message: 'جودة ممتازة',
  },
  {
    id: 4,
    name: 'فاطمة حسن',
    avatar: 'https://github.com/haydenbleasel.png',
    message: 'سعر رائع',
  },
  {
    id: 5,
    name: 'علي أحمد',
    avatar: 'https://github.com/shadcn.png',
  },
];

const colors = [
  {
    foreground: 'text-emerald-800',
    background: 'bg-emerald-50',
  },
  {
    foreground: 'text-rose-800',
    background: 'bg-rose-50',
  },
  {
    foreground: 'text-sky-800',
    background: 'bg-sky-50',
  },
  {
    foreground: 'text-purple-800',
    background: 'bg-purple-50',
  },
  {
    foreground: 'text-amber-800',
    background: 'bg-amber-50',
  },
];

// Helper function to generate random position
const getRandomPosition = () => ({
  x: Math.floor(Math.random() * 80) + 10, // Keep within 10-90% range
  y: Math.floor(Math.random() * 80) + 10, // Keep within 10-90% range
});

interface LiveCursorProps {
  className?: string;
}

const LiveCursor = ({ className }: LiveCursorProps) => {
  const [user1Position, setUser1Position] = useState({
    x: 10,
    y: 8,
  });
  const [user2Position, setUser2Position] = useState({
    x: 30,
    y: 40,
  });
  const [user3Position, setUser3Position] = useState({
    x: 70,
    y: 50,
  });
  const [user4Position, setUser4Position] = useState({
    x: 20,
    y: 70,
  });
  const [user5Position, setUser5Position] = useState({
    x: 60,
    y: 20,
  });

  // Store all user positions in a single array for easier access
  const userPositions = [user1Position, user2Position, user3Position, user4Position, user5Position];

  // Create separate useEffects for each user to move at different intervals
  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser1Position(getRandomPosition());
      },
      Math.random() * 3000 + 2000
    ); // Random interval between 2-5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser2Position(getRandomPosition());
      },
      Math.random() * 4000 + 3000
    ); // Random interval between 3-7 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser3Position(getRandomPosition());
      },
      Math.random() * 2500 + 1500
    ); // Random interval between 1.5-4 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser4Position(getRandomPosition());
      },
      Math.random() * 3500 + 2500
    ); // Random interval between 2.5-6 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser5Position(getRandomPosition());
      },
      Math.random() * 2800 + 1800
    ); // Random interval between 1.8-4.6 seconds
    return () => clearInterval(interval);
  }, []);

  // Assign positions to users
  const usersWithPositions = users.map((user, index) => ({
    ...user,
    position: userPositions[index],
  }));

  return (
    <div className={cn("relative aspect-[4/3] size-full bg-[radial-gradient(rgba(63,63,70,0.3),transparent_1px)] [background-size:16px_16px]", className)}>
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <AvatarStack animate size={24} className="sm:size-32">
          {usersWithPositions.map((user) => (
            <Avatar key={user.id} className="w-6 h-6 sm:w-8 sm:h-8">
              <AvatarImage className="mt-0 mb-0" src={user.avatar} />
              <AvatarFallback className="text-xs">{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarStack>
      </div>
      {usersWithPositions.map((user, index) => (
        <Cursor
          className="absolute transition-all duration-1000"
          key={user.id}
          style={{
            top: `${user.position.y}%`,
            left: `${user.position.x}%`,
          }}
        >
          <CursorPointer
            className={cn(colors[index % colors.length].foreground, "w-2 h-2 sm:w-3 sm:h-3")}
          />
          <CursorBody
            className={cn(
              colors[index % colors.length].background,
              colors[index % colors.length].foreground,
              'gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm'
            )}
          >
            <div className="flex items-center gap-1 sm:gap-2 opacity-100!">
              <Image
                alt={user.name}
                className="mt-0 mb-0 size-3 rounded-full sm:size-4"
                height={16}
                src={user.avatar}
                unoptimized
                width={16}
              />
              <CursorName className="text-xs sm:text-sm">{user.name}</CursorName>
            </div>
            {user.message && <CursorMessage className="text-xs">{user.message}</CursorMessage>}
          </CursorBody>
        </Cursor>
      ))}
    </div>
  );
};

export default LiveCursor; 