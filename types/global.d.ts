declare global {
  type FormInputProps = {
        name: string;
        label: string;
        placeholder: string;
        type?: string;
        register: UseFormRegister;
        error?: FieldError;
        validation?: RegisterOptions;
        disabled?: boolean;
        value?: string;
    };
    
   interface NavLink {
    label: string;
    href: string;
  }
  
   interface NavbarUser {
    name: string;
    email?: string;
    /** Leave empty and pass a real path/URL when wiring this up. */
    avatarSrc?: string;
  }
  
   interface NavbarMenuItem {
    label: string;
    href?: string;
    onSelect?: () => void;
    icon?: React.ReactNode;
    destructive?: boolean;
  }
  
   interface NavbarProps {
    /** Leave empty ("") and swap in a real logo path/URL when wiring this up. */
    logoSrc?: string;
    logoAlt?: string;
    brandName?: string;
    brandHref?: string;
  
    navLinks?: NavLink[];
  
    /** Called when the hamburger / menu button is pressed (e.g. to open a sidebar). */
    onMenuClick?: () => void;
  
    notificationCount?: number;
    onNotificationClick?: () => void;
  
    user?: NavbarUser;
    menuItems?: NavbarMenuItem[];
  }
}