// resources/js/utils/swalTheme.ts
export const SWAL_BASE = {
  width: 640,
  background: "linear-gradient(180deg, #0E1B2E 0%, #0A1527 100%)",
  color: "#E6F0FF",
  showConfirmButton: true,
  confirmButtonColor: "#22C55E", // green that fits your palette
  customClass: {
    popup: "swal-neo",
    title: "swal-title-neo",
    htmlContainer: "swal-html-neo",
    confirmButton: "swal-confirm-neo",
  },
} as const;

// Small helpers so you call them with a clean, consistent look
export const withTheme = (opts: any) => ({ ...SWAL_BASE, ...opts });

export const svgCircle = (content: string) =>
  `<div class="neo-circle">${content}</div>`; // used for custom 'icons'
