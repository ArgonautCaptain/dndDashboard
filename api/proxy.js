export default async function handler(req, res) {
  const { path, ...query } = req.query;

  const apiUrl = `https://dndbeyond.com/api/${path}?${new URLSearchParams(query).toString()}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.DNDBEYOND_API_KEY}`, // Use an environment variable
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from D&D Beyond API: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
