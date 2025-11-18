export function useLogout() {
  const logout = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Logout failed:", errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always redirect to login, even if logout API call fails
      // This ensures the user is logged out from the client side
      window.location.href = "/login";
    }
  };

  return { logout };
}

