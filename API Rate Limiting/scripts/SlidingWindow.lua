-- KEYS[1] = redis key (e.g. ratelimit:ip:127.0.0.1)
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

local function getResetMs()
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')

  if oldest[2] then
    local oldestScore = tonumber(oldest[2])
    local resetMs = windowMs - (now - oldestScore)

    if resetMs < 0 then
      return 0
    end

    return resetMs
  end

  return windowMs
end

-- Step 1: purane entries hatao jo window se bahar hain
redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

-- Step 2: current window mein kitni requests hain
local requestCount = redis.call('ZCARD', key)

if requestCount < maxRequests then
  -- Step 3: naya entry add karo
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, windowMs)

  return {1, requestCount + 1, getResetMs()}
else
  redis.call('PEXPIRE', key, windowMs)

  return {0, requestCount, getResetMs()}
end