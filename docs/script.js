// Keep downloads current while retaining working links if GitHub is unavailable.
(async () => {
  const repo = 'vinay-winai/LowP-Public';
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return;
    const release = await response.json();
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const allowed = `https://github.com/${repo}/releases/download/`;
    const find = predicate => assets.find(asset => typeof asset.name === 'string' && predicate(asset.name) && typeof asset.browser_download_url === 'string' && asset.browser_download_url.startsWith(allowed));
    const downloads = {
      android: find(name => /^LowP.*\.apk$/i.test(name)),
      chrome: find(name => /^LowP-Chrome-Extension.*\.zip$/i.test(name)),
      checksums: find(name => name === 'SHA256SUMS.txt')
    };
    for (const [platform, asset] of Object.entries(downloads)) {
      if (asset) document.querySelectorAll(`[data-download="${platform}"]`).forEach(link => { link.href = asset.browser_download_url; });
    }
    if (typeof release.html_url === 'string' && release.html_url.startsWith(`https://github.com/${repo}/releases/tag/`)) {
      document.getElementById('release-badge').href = release.html_url;
      document.getElementById('all-releases').href = release.html_url;
    }
    if (typeof release.tag_name === 'string' && release.tag_name.length < 50) document.getElementById('release-label').textContent = `${release.tag_name} available`;
  } catch {
    // Static download links remain usable without JavaScript or network access to the API.
  }
})();
