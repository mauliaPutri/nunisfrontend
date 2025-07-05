// @/components/Layout/SideBarButton.js
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button, ButtonProps } from './ui/button';
import { cn } from '@/lib/utils';
import { SheetClose } from './ui/sheet';

interface SideBarButtonProps extends ButtonProps {
    icon?: LucideIcon;
    iconClassName?: string; // Add iconClassName prop
}

export default function SideBarButton({ icon: Icon, iconClassName, className, children, ...props }: SideBarButtonProps) {
    return (
        <Button
            variant='ghost'
            className={cn(
                'gap-3 justify-start w-full',
                className
            )}
            {...props}
        >
            {Icon && <Icon size={20} className={cn(iconClassName)} />} {/* Apply iconClassName */}
            <span>{children}</span>
        </Button>
    );
}

export function SideBarButtonSheet(props: SideBarButtonProps) {
    return (
        <SheetClose asChild>
            <SideBarButton {...props} />
        </SheetClose>
    )
}
