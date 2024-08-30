import React, { useState } from 'react';
import { TextField } from '@mui/material';

const UserSearch = () => {
  const [search, setSearch] = useState('');

  return (
    <div>
      <TextField
        label="Search User @"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        sx={{ backgroundColor: 'white' }}
      />
    </div>
  );
};

export default UserSearch;
