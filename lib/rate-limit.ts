type RateLimitStore = {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
};

const store: RateLimitStore = {};

export function rateLimit(ip: string, limit = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { success: true, remaining: limit - 1 };
  }

  const record = store[ip];
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}
