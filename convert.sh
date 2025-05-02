#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/file.pdf"
  exit 1
fi

pdf="$1"
[ ! -f "$pdf" ] && echo "File not found: $pdf" && exit 1

dir="$(dirname "$pdf")"
prefix="$dir/oboi_tmp"

pdftoppm -png -rx 300 -ry 300 "$pdf" "$prefix"

i=0
for f in "${prefix}"-*.png; do
  out="$dir/oboi_$(printf '%03d' "$i").webp"
  magick "$f" -resize 2481x3509\! "$out"
  rm "$f"
  i=$((i + 1))
done