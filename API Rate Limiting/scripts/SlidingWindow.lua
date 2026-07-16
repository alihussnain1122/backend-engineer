
-- KEYS[1] = redis key (e.g. ratelimit:127.0.0.1)
-- ARGV[1] = current timestamp (now)
-- ARGV[2] = window size in ms
-- ARGV[3] = max requests allowed
-- ARGV[4] = unique member string

local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])
local member = ARGV[4]

local windowStart = now - windowMs

-- Step 1: purane entries hatao jo window se bahar hain
redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

-- Step 2: current window mein kitni requests hain
local requestCount = redis.call('ZCARD', key)

if requestCount < maxRequests then
  -- Step 3: naya entry add karo
  redis.call('ZADD', key, now, member)

  -- Step 4: key ko expire kar do (memory cleanup)
  redis.call('EXPIRE', key, math.ceil(windowMs / 1000))

  return 1  -- allowed
else
  return 0  -- blocked
end