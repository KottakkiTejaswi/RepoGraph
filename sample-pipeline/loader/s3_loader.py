import boto3

def load_from_s3(bucket_name, key):
    print(f"Loading {key} from {bucket_name}")
    s3 = boto3.client("s3")
    obj = s3.get_object(Bucket=bucket_name, Key=key)
    return obj["Body"].read()

if __name__ == "__main__":
    data = load_from_s3("demo-bucket", "input.json")
    print(len(data))
