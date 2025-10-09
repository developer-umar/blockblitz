
import rateLimit from "express-rate-limit";

export const likeLimiter = rateLimit({
  windowMs: 3000, // 3 seconds
  max: 2,         // 2 likes/unlikes per 3 sec
  message: "Too many like actions, slow down!"

});

// isme next lagane ki zaroorat nhi  ye express rate limit apne aap handle kar leta hai 

