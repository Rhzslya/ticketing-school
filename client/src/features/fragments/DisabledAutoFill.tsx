const DisabledAutoFill = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        opacity: 0,
        position: "absolute",
        zIndex: -1,
        width: 0,
        height: 0,
        overflow: "hidden",
      }}
    >
      <input
        type="text"
        name="fake_username"
        tabIndex={-1}
        autoComplete="username"
      />
      <input
        type="password"
        name="fake_password"
        tabIndex={-1}
        autoComplete="current-password"
      />
    </div>
  );
};

export default DisabledAutoFill;
