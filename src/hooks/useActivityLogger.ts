export function useActivityLogger() {
  const logActivity = async (activity: any) => {
    // Mock activity logging since table doesn't exist
    console.log('Activity logged:', activity);
  };

  return { logActivity };
}