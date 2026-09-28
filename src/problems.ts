export const problems = {
  "two-sum": {
    functionName: "twoSum",
    tests: [
      {
        args: [[2, 7, 11, 15], 9],
        expected: [0, 1],
      },
      {
        args: [[3, 2, 4], 6],
        expected: [1, 2],
      },
      {
        args: [[3, 3], 6],
        expected: [0, 1],
      },
      {
        args: [[-3, 4, 3, 90], 0],
        expected: [0, 2],
      },
    ],
  },
  "valid-parentheses": {
    functionName: "isValid",
    tests: [
      {
        args: ["()[]{}"],
        expected: true,
      },
      {
        args: ["([)]"],
        expected: false,
      },
      {
        args: ["{[]}"],
        expected: true,
      },
      {
        args: ["("],
        expected: false,
      },
      {
        args: [""],
        expected: true,
      },
    ],
  },
  "binary-search": {
    functionName: "binarySearch",
    tests: [
      {
        args: [[-1, 0, 3, 5, 9, 12], 9],
        expected: 4,
      },
      {
        args: [[-1, 0, 3, 5, 9, 12], 2],
        expected: -1,
      },
      {
        args: [[], 2],
        expected: -1,
      },
      {
        args: [[5], 5],
        expected: 0,
      },
      {
        args: [[1, 3, 5, 7, 9], 1],
        expected: 0,
      },
    ],
  },
  "contains-duplicate": {
    functionName: "containsDuplicate",
    tests: [
      {
        args: [[1, 2, 3, 1]],
        expected: true,
      },
      {
        args: [[1, 2, 3, 4]],
        expected: false,
      },
      {
        args: [[]],
        expected: false,
      },
      {
        args: [[-1, -1, 2]],
        expected: true,
      },
    ],
  },
  "valid-anagram": {
    functionName: "isAnagram",
    tests: [
      {
        args: ["anagram", "nagaram"],
        expected: true,
      },
      {
        args: ["rat", "car"],
        expected: false,
      },
      {
        args: ["", ""],
        expected: true,
      },
      {
        args: ["aacc", "ccac"],
        expected: false,
      },
    ],
  },
  "best-time-to-buy-and-sell-stock": {
    functionName: "maxProfit",
    tests: [
      {
        args: [[7, 1, 5, 3, 6, 4]],
        expected: 5,
      },
      {
        args: [[7, 6, 4, 3, 1]],
        expected: 0,
      },
      {
        args: [[2]],
        expected: 0,
      },
      {
        args: [[2, 4, 1, 7]],
        expected: 6,
      },
    ],
  },
  "maximum-subarray": {
    functionName: "maxSubArray",
    tests: [
      {
        args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expected: 6,
      },
      {
        args: [[1]],
        expected: 1,
      },
      {
        args: [[-3, -2, -5]],
        expected: -2,
      },
      {
        args: [[5, -1, 5]],
        expected: 9,
      },
    ],
  },
  "product-of-array-except-self": {
    functionName: "productExceptSelf",
    tests: [
      {
        args: [[1, 2, 3, 4]],
        expected: [24, 12, 8, 6],
      },
      {
        args: [[-1, 1, 0, -3, 3]],
        expected: [0, 0, 9, 0, 0],
      },
      {
        args: [[0, 0, 2]],
        expected: [0, 0, 0],
      },
      {
        args: [[2, 3]],
        expected: [3, 2],
      },
    ],
  },
  "maximum-product-subarray": {
    functionName: "maxProduct",
    tests: [
      {
        args: [[2, 3, -2, 4]],
        expected: 6,
      },
      {
        args: [[-2, 0, -1]],
        expected: 0,
      },
      {
        args: [[-2, 3, -4]],
        expected: 24,
      },
      {
        args: [[-1]],
        expected: -1,
      },
    ],
  },
  "find-minimum-in-rotated-sorted-array": {
    functionName: "findMin",
    tests: [
      {
        args: [[3, 4, 5, 1, 2]],
        expected: 1,
      },
      {
        args: [[4, 5, 6, 7, 0, 1, 2]],
        expected: 0,
      },
      {
        args: [[1]],
        expected: 1,
      },
      {
        args: [[1, 2, 3]],
        expected: 1,
      },
    ],
  },
  "search-in-rotated-sorted-array": {
    functionName: "searchRotated",
    tests: [
      {
        args: [[4, 5, 6, 7, 0, 1, 2], 0],
        expected: 4,
      },
      {
        args: [[4, 5, 6, 7, 0, 1, 2], 3],
        expected: -1,
      },
      {
        args: [[], 5],
        expected: -1,
      },
      {
        args: [[1], 1],
        expected: 0,
      },
    ],
  },
  "container-with-most-water": {
    functionName: "maxArea",
    tests: [
      {
        args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]],
        expected: 49,
      },
      {
        args: [[1, 1]],
        expected: 1,
      },
      {
        args: [[4, 3, 2, 1, 4]],
        expected: 16,
      },
      {
        args: [[0, 2, 0, 3]],
        expected: 4,
      },
    ],
  },
  "valid-palindrome": {
    functionName: "isPalindrome",
    tests: [
      {
        args: ["A man, a plan, a canal: Panama"],
        expected: true,
      },
      {
        args: ["race a car"],
        expected: false,
      },
      {
        args: [" "],
        expected: true,
      },
      {
        args: ["0P"],
        expected: false,
      },
    ],
  },
  "longest-substring-without-repeating-characters": {
    functionName: "lengthOfLongestSubstring",
    tests: [
      {
        args: ["abcabcbb"],
        expected: 3,
      },
      {
        args: ["bbbbb"],
        expected: 1,
      },
      {
        args: ["pwwkew"],
        expected: 3,
      },
      {
        args: [""],
        expected: 0,
      },
      {
        args: ["dvdf"],
        expected: 3,
      },
    ],
  },
  "longest-repeating-character-replacement": {
    functionName: "characterReplacement",
    tests: [
      {
        args: ["ABAB", 2],
        expected: 4,
      },
      {
        args: ["AABABBA", 1],
        expected: 4,
      },
      {
        args: ["AAAA", 0],
        expected: 4,
      },
      {
        args: ["", 0],
        expected: 0,
      },
    ],
  },
  "climbing-stairs": {
    functionName: "climbStairs",
    tests: [
      {
        args: [1],
        expected: 1,
      },
      {
        args: [2],
        expected: 2,
      },
      {
        args: [3],
        expected: 3,
      },
      {
        args: [5],
        expected: 8,
      },
      {
        args: [10],
        expected: 89,
      },
    ],
  },
  "house-robber": {
    functionName: "rob",
    tests: [
      {
        args: [[1, 2, 3, 1]],
        expected: 4,
      },
      {
        args: [[2, 7, 9, 3, 1]],
        expected: 12,
      },
      {
        args: [[]],
        expected: 0,
      },
      {
        args: [[5]],
        expected: 5,
      },
    ],
  },
  "coin-change": {
    functionName: "coinChange",
    tests: [
      {
        args: [[1, 2, 5], 11],
        expected: 3,
      },
      {
        args: [[2], 3],
        expected: -1,
      },
      {
        args: [[1], 0],
        expected: 0,
      },
      {
        args: [[2, 5, 10, 1], 27],
        expected: 4,
      },
    ],
  },
  "longest-increasing-subsequence": {
    functionName: "lengthOfLIS",
    tests: [
      {
        args: [[10, 9, 2, 5, 3, 7, 101, 18]],
        expected: 4,
      },
      {
        args: [[0, 1, 0, 3, 2, 3]],
        expected: 4,
      },
      {
        args: [[7, 7, 7, 7]],
        expected: 1,
      },
      {
        args: [[]],
        expected: 0,
      },
    ],
  },
  "counting-bits": {
    functionName: "countBits",
    tests: [
      {
        args: [0],
        expected: [0],
      },
      {
        args: [2],
        expected: [0, 1, 1],
      },
      {
        args: [5],
        expected: [0, 1, 1, 2, 1, 2],
      },
      {
        args: [8],
        expected: [0, 1, 1, 2, 1, 2, 2, 3, 1],
      },
    ],
  },
  "missing-number": {
    functionName: "missingNumber",
    tests: [
      {
        args: [[3, 0, 1]],
        expected: 2,
      },
      {
        args: [[0, 1]],
        expected: 2,
      },
      {
        args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]],
        expected: 8,
      },
      {
        args: [[]],
        expected: 0,
      },
    ],
  },
  "single-number": {
    functionName: "singleNumber",
    tests: [
      {
        args: [[2, 2, 1]],
        expected: 1,
      },
      {
        args: [[4, 1, 2, 1, 2]],
        expected: 4,
      },
      {
        args: [[-7]],
        expected: -7,
      },
      {
        args: [[0, -3, 0]],
        expected: -3,
      },
    ],
  },
  "jump-game": {
    functionName: "canJump",
    tests: [
      {
        args: [[2, 3, 1, 1, 4]],
        expected: true,
      },
      {
        args: [[3, 2, 1, 0, 4]],
        expected: false,
      },
      {
        args: [[0]],
        expected: true,
      },
      {
        args: [[2, 0, 0]],
        expected: true,
      },
    ],
  },
  "unique-paths": {
    functionName: "uniquePaths",
    tests: [
      {
        args: [3, 7],
        expected: 28,
      },
      {
        args: [3, 2],
        expected: 3,
      },
      {
        args: [1, 1],
        expected: 1,
      },
      {
        args: [4, 4],
        expected: 20,
      },
    ],
  },
} as const;
export type ProblemSlug = keyof typeof problems;
