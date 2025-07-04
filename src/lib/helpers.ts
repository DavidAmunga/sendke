// Helper function to draw the path for a rounded rectangle with left corners rounded
export function roundRectLeft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
}

export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  const match = numbers.match(/^(\d{4})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return value;
};

export const formatBusinessNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 0) return "";

  // Format numbers into groups of 3-4 digits
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    // Split into two groups of 3
    return numbers.replace(/(\d{3})(\d{1,3})/, "$1 $2");
  } else if (numbers.length <= 7) {
    // Split into 3 + 4
    return numbers.replace(/(\d{3})(\d{1,4})/, "$1 $2");
  } else if (numbers.length <= 8) {
    // Split into 4 + 4
    return numbers.replace(/(\d{4})(\d{1,4})/, "$1 $2");
  } else if (numbers.length <= 9) {
    // Split into 3 + 3 + 3
    return numbers.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1 $2 $3");
  } else {
    // For longer numbers, split into 3 + 3 + 4
    return numbers.replace(/(\d{3})(\d{3})(\d{1,4})/, "$1 $2 $3");
  }
};

export const formatAccountNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 0) return "";

  // Format numbers into groups of 4 digits
  const groups = [];
  for (let i = 0; i < numbers.length; i += 4) {
    groups.push(numbers.slice(i, i + 4));
  }
  return groups.join(" ");
};
