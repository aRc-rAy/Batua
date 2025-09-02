// Debug script to test date grouping logic
const testDates = [
  new Date().toISOString(), // Today
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday  
  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
];

console.log('Current date:', new Date().toISOString());
console.log('Test dates:', testDates);

const getDateLabel = (dateString) => {
  const paymentDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  console.log('Payment date:', paymentDate);
  console.log('Today:', today);
  console.log('Yesterday:', yesterday);

  // Compare dates using local date components to avoid timezone issues
  const isSameDay = (date1, date2) => {
    const same = date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
    console.log(`Comparing ${date1.toLocaleDateString()} with ${date2.toLocaleDateString()}: ${same}`);
    return same;
  };

  if (isSameDay(paymentDate, today)) {
    return 'Today';
  } else if (isSameDay(paymentDate, yesterday)) {
    return 'Yesterday';
  } else {
    return paymentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
    });
  }
};

testDates.forEach((dateStr, index) => {
  console.log(`\n=== Test ${index + 1} ===`);
  console.log('Date string:', dateStr);
  console.log('Label:', getDateLabel(dateStr));
});
