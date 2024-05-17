import { AlertProps, SnackbarProps } from '@mui/material';
import { Alert, IconButton, Snackbar, SnackbarCloseReason, SnackbarOrigin } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { v4 } from 'uuid'
import React from 'react';

type ToastOptions = {
  autoId?: string;
  showCloseButton?: boolean;
  showIcon?: boolean;
};
type SnackbarOptions = Omit<SnackbarProps, 'children' | 'open'>;
type AlertOptions = Omit<AlertProps, ''>;

export type SnackbarState = {
  message: React.ReactNode;
  toastOptions: ToastOptions;
  snackbarOptions: SnackbarOptions;
  alertOptions: AlertOptions;
};

export interface ToastsContextType {
  showToast: (message: React.ReactNode, toastOptions?: ToastOptions, snackbarOptions?: SnackbarOptions, alertOptions?: AlertOptions) => void;
  dismissToast: () => void;
}

// ------------------------------------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------------------------------------

const DEFAULT_AUTO_HIDE_DURATION = 2000;

// const DEFAULT_TRANSITION = (props: SlideProps) => (
//   <Slide
//     {...props}
//     direction="down"
//   />
// );

const DEFAULT_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: 'top',
  horizontal: 'center'
};

// ------------------------------------------------------------------------------------------------
// Collection of all toast methods, initially configured to log warnings only. When ToastProvider
// is initialized or changed, its methods are save in this collection. This collection is useful
// to grant global access to toast methods (outside components and hooks).
//
// The ToastProvider is used in index.tsx, and hence these methods are not usable in it, or any
// function directly invoked by it!
// ------------------------------------------------------------------------------------------------

const TOAST_METHODS: ToastsContextType = {
  showToast: (message, toastOptions, snackbarOptions, alertOptions) => {
    console.warn('SnackbarProvider not initialized yet!', message, toastOptions, snackbarOptions, alertOptions);
  },
  dismissToast: () => {
    console.warn('SnackbarProvider not initialized yet!');
  }
};

// ------------------------------------------------------------------------------------------------
// Context
// ------------------------------------------------------------------------------------------------

/**
 * Toasts context. Allows components and hooks to access toast methods like so:
 * 
 * const { showToast } = useContext(ToastContext);
 * 
 */
export const ToastContext = createContext<ToastsContextType>(TOAST_METHODS);

// ------------------------------------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------------------------------------

/**
 * Toasts hook. Allows components and hooks to access toast methods like so:
 * 
 * const { showToast } = useToasts();
 * 
 * @returns Object that can be destructured into required toast methods.
 */
export function useToasts() {
  return useContext(ToastContext);
}

// ------------------------------------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------------------------------------

type Props = {
  children: React.ReactElement;
}
/**
 * Toasts provider. Initialize Toasts context with proper implementations of toast methods.
 */
export const ToastsProvider: React.FC<Props> = ({ children }) => {
  // State for this component
  const [state, setState] = useState<SnackbarState>({ message: '', toastOptions: {}, snackbarOptions: {}, alertOptions: {} });
  // Whether a toast is showing or not
  const [isOpen, setOpen] = useState(false);

  // Dismisses the current toast
  const dismissToast = useCallback<ToastsContextType['dismissToast']>(() => {
    setOpen(false);
  }, []);

  // Component for close button
  const closeButton = useMemo(
    () => (
      <IconButton
        className="iconSetting"
        size="small"
        aria-label="close"
        color="inherit"
        onClick={dismissToast}>
        <span className="icon close" />
      </IconButton>
    ),
    [dismissToast]
  );

  // Shows an info toast
  const showToast = useCallback<ToastsContextType['showToast']>(
    (message, toastOptions, snackbarOptions, alertOptions) => {
      const newState: SnackbarState = {
        message,
        toastOptions: {
          autoId: 'info-toast',
          ...toastOptions // Overrides
        },
        snackbarOptions: {
          anchorOrigin: DEFAULT_ANCHOR_ORIGIN,
          autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
          className: 'info',
          key: v4(),
          ...snackbarOptions // Overrides
        },
        alertOptions: {
          action: toastOptions?.showCloseButton === false ? alertOptions?.action : closeButton,
          severity: 'info',
          ...alertOptions, // Overrides
          icon: toastOptions?.showIcon === true ? alertOptions?.icon : false // Show icon only if showIcon=true
        }
      };
      setState(newState);
      setOpen(true);
    },
    [closeButton]
  );

  // Callback invoked when a toast is auto- or manually dismissed
  const onClose = useCallback(
    (event: Event | React.SyntheticEvent<unknown, Event>, reason: SnackbarCloseReason) => {
      dismissToast();
      state.snackbarOptions.onClose?.(event, reason);
    },
    [dismissToast, state.snackbarOptions]
  );

  // Save references to toast methods in global collection for future use outside components and hooks
  TOAST_METHODS.showToast = showToast;
  TOAST_METHODS.dismissToast = dismissToast;

  // Component for snackbar
  const snackbar = useMemo(
    () => (
      <Snackbar
        auto-id={state.toastOptions.autoId || 'toast'}
        // TransitionComponent={DEFAULT_TRANSITION}
        {...state.snackbarOptions} // Overrides
        open={isOpen} // Override open
        onClose={onClose} // Override onClose
      >
        <Alert
          {...state.alertOptions} // Overrides
        >
          {state.message}
        </Alert>
      </Snackbar>
    ),
    [state.alertOptions, isOpen, state.message, onClose, state.snackbarOptions, state.toastOptions.autoId]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissToast
      }}>
      <React.Fragment>
        {children}
        {snackbar}
      </React.Fragment>
    </ToastContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------
// Globally-accessible toast methods outside of components and hooks.
// ------------------------------------------------------------------------------------------------

/**
 * Shows an info toast.
 *
 * @param message The message to be shown. This can be any valid React node, including a plain string.
 * @param toastOptions Optional overrides for toast options (autoId, showCloseButton, showIcon)
 * @param snackbarOptions Optional overrides for snackbar props (anchorOrigin, autoHideDuration, etc)
 * @param alertOptions Optional overrides for alert props (action, icon, variant, etc)
 *
 * 
 * showToast('toast');                                 // Auto-hide=2s, no icon, has close button
 * showToast(<div>toast</div>);                        // Works with JSX
 * showToast('toast', { autoId: '...' });              // Custom auto-id
 * showToast('toast', { showCloseButton: false });     // No close button
 * showToast('toast', { showIcon: true });             // Show icon
 * showToast('toast', {}, { autoHideDuration: 5000 }); // Auto-hide=5s
 * showToast('toast', {}, { autoHideDuration: null }); // No auto-hide
 * showToast('toast', {}, { anchorOrigin: {...} });    // Custom anchor origin
 * showToast('toast', {}, {}, { icon: ... });          // Custom icon
 * showToast('toast', {}, {}, { action: ... });        // Custom close button
 * 
 */
export const showToast: ToastsContextType['showToast'] = (message, toastOptions, snackbarOptions, alertOptions) => TOAST_METHODS.showToast(message, toastOptions, snackbarOptions, alertOptions);
export const showToast2: ToastsContextType['showToast'] = (message) => TOAST_METHODS.showToast(message, { showCloseButton: true }, { action: 'X', autoHideDuration: 5000}, { variant: 'filled', color: 'warning'});

/**
 * Dismisses any visible toast. This is useful when we want to include buttons or links in a toast that should dismiss it when clicked.
 *
 * 
 * showSuccessToast('Success!', {}, {}, { action: <Button onClick={dismissToast}>Dismiss</Button> }); // Replace [x] button with [Dismiss]
 * 
 */
export const dismissToast: ToastsContextType['dismissToast'] = () => TOAST_METHODS.dismissToast();