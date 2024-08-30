import React, { useState } from 'react';
import { TextField } from '@mui/material';

const UserSearch = () => {
  const [search, setSearch] = useState('');

  return (
    <div>
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
    </div>
  );
};

export default UserSearch;
